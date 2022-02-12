import * as vscode from 'vscode';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import * as fs from 'fs';
import { CodeEntity } from './CodeEntity';
import { GycTools } from './GycTools';
import { columnQuerierFactory } from './DataBase';

export class CodeGenerator {

    selectedConnection: any;
    selectedDataBase: string;
    selectedTableName: string;
    context: vscode.ExtensionContext;
    hasConfigFileInWorkspace: boolean = false;
    targetProject: GycTools.ProjectConfig;
    sourceDatabaseConfig: GycTools.DatabaseConfig;


    readonly columnQuerier: GycTools.ColumnQuerier;

    constructor(context: vscode.ExtensionContext, selectedItem: any, targetProject: GycTools.ProjectConfig) {
        this.context = context;
        this.selectedTableName = selectedItem.value;
        this.targetProject = targetProject;
        this.columnQuerier = columnQuerierFactory(selectedItem);
        this.sourceDatabaseConfig = this.getSourceDatabase();
    }

    generateNew() {
        this.columnQuerier.getTableColumnInfo().then((columnArray) => {
            let codeEntity = new CodeEntity(this.columnQuerier, columnArray, this.targetProject.baseModelProperties, this.sourceDatabaseConfig);

            const templatePath = GycTools.Utils.getTemplatePath(this.context, this.targetProject);
            if (!fs.existsSync(templatePath)) {
                vscode.window.showErrorMessage('template path error');
                return;
            }

            nunjucks.configure(templatePath, { autoescape: false, trimBlocks: true, lstripBlocks: true }); //config template path
            let temlpateList: any[] = this.sourceDatabaseConfig.templateList; //get templates list config
            temlpateList = temlpateList.filter((e) => { return e.enabled === undefined || e.enabled === true; });
            temlpateList.forEach((t) => {
                codeEntity.template = t;
                const renderString = nunjucks.render(t.templateName, codeEntity); //render code
                const outDirectory = path.join(this.targetProject.projectFullPath, t.outPath);
                if (!fs.existsSync(outDirectory)) {
                    fs.mkdirSync(outDirectory, { recursive: true });
                }
                const outFliePath = path.join(outDirectory, `${codeEntity.className}` + t.outFileType);//generate code file
                if (renderString.length > 0) {
                    if (fs.existsSync(outFliePath) && this.targetProject.overrideExists !== undefined && this.targetProject.overrideExists === false) {
                        vscode.window.showInformationMessage(`${codeEntity.className}` + t.outFileType + ' file exists');
                    } else {
                        fs.writeFileSync(outFliePath, renderString);
                        if (this.targetProject.openFileWhenComplete) {
                            const doc = vscode.workspace.openTextDocument(outFliePath).then((d) => {
                                vscode.window.showTextDocument(d, { preserveFocus: false, viewColumn: vscode.ViewColumn.Beside });
                            });
                        }
                    }
                } else {
                    vscode.window.showErrorMessage('template error:', t.templateName);
                }
            });
            vscode.window.showInformationMessage('gyctools:generate successfully', 'OK');

        }).catch((error) => {
            console.error(error);
            vscode.window.showErrorMessage(error.message);
        }).finally(() => {
            this.columnQuerier.close();
        });
    }

    private getSourceDatabase(): GycTools.DatabaseConfig {
        let sourceDatabaseConfig = this.targetProject?.dataBaseList.filter((e) => { return e.dataBaseName === this.selectedDataBase; })[0];
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