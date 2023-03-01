import * as vscode from 'vscode';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import * as fs from 'fs';
import { CodeEntity } from './CodeEntity';
import { GycTools } from './GycTools';
import { dataQuerierFactory } from './DataSource';

export class CodeGenerator {

    selectedConnection: any;
    selectedDataBase: string;
    selectedTableName: string;
    context: vscode.ExtensionContext;
    hasConfigFileInWorkspace: boolean = false;
    targetProject: GycTools.ProjectConfig;
    sourceDatabaseConfig: GycTools.DatabaseConfig;
    readonly columnQuerier: GycTools.DataQuerier;
    isSelectedWithDB: boolean = false;

    constructor(context: vscode.ExtensionContext, selectedItem: any, targetProject: GycTools.ProjectConfig, isSelectedWithDB?: boolean) {
        this.context = context;
        this.selectedTableName = selectedItem.value;
        this.selectedDataBase = selectedItem.metadata.database;
        this.targetProject = targetProject;
        this.columnQuerier = dataQuerierFactory(selectedItem);
        this.sourceDatabaseConfig = this.getSourceDatabase();
        if (isSelectedWithDB) {
            this.isSelectedWithDB = isSelectedWithDB;
        }
    }

    generateNew():number {
        let count = 0;
        let tableInfo;
        this.columnQuerier.getTableInfo(this.columnQuerier.tableName).then(async t=>{
            tableInfo = t[0];
        }).catch((error) => {
            console.error(error);
            vscode.window.showErrorMessage(error.message);
        }).finally(() => {
            this.columnQuerier.close();
        });

        this.columnQuerier.getTableColumnInfo(this.columnQuerier.tableName).then( async (columnArray) => {
            let templateDir = GycTools.Utils.getTemplatePath(this.context, this.targetProject);
            if (!fs.existsSync(templateDir)) {
                vscode.window.showErrorMessage('template dir error');
                return;
            }
            let temlpateList: GycTools.TemplateInfo[] = this.sourceDatabaseConfig.templateList; //get templates list config
            temlpateList = temlpateList.filter((e) => { return e.enabled === undefined || e.enabled === true; });

            temlpateList.forEach((t) => {
                let codeEntity = new CodeEntity(this.columnQuerier, columnArray, this.targetProject.baseModelProperties, this.sourceDatabaseConfig, t);
                codeEntity.template = t;
                codeEntity.tableComment = tableInfo.comment;
                const templatePath = path.join(templateDir, t.templateName);
                nunjucks.configure(path.dirname(templatePath), { autoescape: false, trimBlocks: true, lstripBlocks: true }); //config template path
                
                const outDirectory = path.join(this.targetProject.projectFullPath, t.outPath);
                if (!fs.existsSync(outDirectory)) {
                    fs.mkdirSync(outDirectory, { recursive: true });
                }
                const outFliePath = path.join(outDirectory, `${codeEntity.className}` + t.outFileType);//generate code file
                const holdingCodes = this.getholdingInfo(outFliePath);
                codeEntity.holdingCode = holdingCodes;
                const renderString = nunjucks.render(path.basename(templatePath), codeEntity); //render code
                if (renderString.length > 0) {
                    count = count + this.generateCodeFile(outFliePath, renderString);
                } else {
                    vscode.window.showErrorMessage('template error:', t.templateName);
                }
            });
            if(!this.isSelectedWithDB){
                vscode.window.showInformationMessage('gyctools:generate '+ this.selectedTableName +' successfully', 'OK');
            }
        }).catch((error) => {
            console.error(error);
            vscode.window.showErrorMessage(error.message);
        }).finally(() => {
            this.columnQuerier.close();
        });
        return count;
    }

    private getholdingInfo(outFliePath: string):any {
        const fileExists = fs.existsSync(outFliePath);
        if (!fileExists){
            return undefined;
        }
        const oldString = fs.readFileSync(outFliePath, "utf-8");
        const checkReult = oldString.match(GycTools.Constants.holdingEndRegs);
        if(checkReult && checkReult.length>=1){
            const endLine = checkReult[0];
            const stringArrays = oldString.split(GycTools.Constants.holdingEndRegs);
            let holdingArrays = {};
            stringArrays.forEach(str => {
                str = str + endLine;
                const regResult = str.match(GycTools.Constants.holdingReg);
                if(regResult && regResult.length>=3){
                    Object.defineProperty(holdingArrays,regResult[1],{value:regResult[2]});
                }
            });
            return holdingArrays;
        }
        return undefined;
    }

    private generateCodeFile(outFliePath: string, renderString: string): number {
        const fileExists = fs.existsSync(outFliePath);
        if (fileExists && ( !this.targetProject.overrideExists || this.isSelectedWithDB )) {
            if(!this.isSelectedWithDB){
                vscode.window.showInformationMessage(`${outFliePath}` + ' file exists', "Update the config item 'overrideExists' to cover this file");
                return 0;
            }
        } else {
            fs.writeFileSync(outFliePath, renderString);
            if (this.targetProject.openFileWhenComplete) {
                const doc = vscode.workspace.openTextDocument(outFliePath).then((d) => {
                    vscode.window.showTextDocument(d, { preserveFocus: false, viewColumn: vscode.ViewColumn.Beside });
                });
            }
            return 1;
        }
    }

    private getSourceDatabase(): GycTools.DatabaseConfig {
        let sourceDatabaseConfig = this.targetProject?.dataBaseList.filter((e) => {
            return e.dataBaseName === this.selectedDataBase;
        })[0];
        if (!sourceDatabaseConfig) {
            if (this.targetProject && this.targetProject.dataBaseList.length >= 0) {
                sourceDatabaseConfig = this.targetProject.dataBaseList[0];
            } else {
                vscode.window.showErrorMessage('target database is not in config.');
            }
        }
        return sourceDatabaseConfig;
    }

}