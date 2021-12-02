import * as vscode from 'vscode';
import * as mysql from 'mysql';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import * as fs from 'fs';
import { CodeEntity } from './CodeEntity';
import { GycTools } from './GycTools';

export class CodeGenerator {

    selectedConnection: any;
    selectedDataBase: string;
    selectedTableName: string;
    context: vscode.ExtensionContext;
    hasConfigFileInWorkspace: boolean = false;
    targetProject: GycTools.ProjectConfig;
    sourceDatabaseConfig: GycTools.DatabaseConfig;


    readonly dbConnect: mysql.Connection;

    constructor(context: vscode.ExtensionContext, selectedItem: any, targetProject: GycTools.ProjectConfig) {
        this.context = context;

        this.selectedConnection = selectedItem.conn;
        this.selectedDataBase = selectedItem.parent.parent.value;
        this.selectedTableName = selectedItem.value;

        this.targetProject = targetProject;
        this.sourceDatabaseConfig = this.getSourceDatabase();

        this.dbConnect = mysql.createConnection({
            host: this.selectedConnection.server,
            port: this.selectedConnection.port,
            user: this.selectedConnection.username,
            password: this.selectedConnection.password,
            database: this.selectedConnection.database
        });

    }

    generate() {
        const sqlCommand = `SELECT * FROM information_schema.COLUMNS where TABLE_NAME = '${this.selectedTableName}' AND TABLE_SCHEMA ='${this.selectedDataBase}' `;
        this.dbConnect.connect();
        const pq = GycTools.Utils.getColumnInfo(this.dbConnect, sqlCommand);
        pq.then((result) => {
            //console.log(result);
            let codeEntity = new CodeEntity(this.selectedTableName, result, this.targetProject.baseModelProperties, this.sourceDatabaseConfig);
            //get template path
            let templatePath = path.join(this.context.extensionPath, GycTools.Constants.defaultTemplateDirectory);
            if (this.sourceDatabaseConfig.templatePath && this.sourceDatabaseConfig.templatePath.length > 0) {
                templatePath = path.join(this.sourceDatabaseConfig.templatePath);
            }
            if (!fs.existsSync(templatePath)) {
                vscode.window.showErrorMessage('template path error');
                return;
            }
            nunjucks.configure(templatePath, { autoescape: false }); //config template path

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
                    fs.writeFileSync(outFliePath, renderString);
                    if (this.targetProject.openFileWhenComplete) {
                        const doc = vscode.workspace.openTextDocument(outFliePath).then((d) => {
                            vscode.window.showTextDocument(d, { preserveFocus: false, viewColumn: vscode.ViewColumn.Beside });
                        });
                    }
                } else {
                    vscode.window.showErrorMessage('template error:', t.templateName);
                }
            });
            vscode.window.showInformationMessage('gyctools:generate successfully');
        }).catch((error) => {
            vscode.window.showErrorMessage(error);
        }).finally(() => {
            this.dbConnect.end();
        });
    }

    private getSourceDatabase(): GycTools.DatabaseConfig {
        let sourceDatabaseConfig = this.targetProject?.dataBaseList.filter((e) => { return e.dataBaseName === this.selectedDataBase; })[0];
        if (!sourceDatabaseConfig) {
            if (this.targetProject && this.targetProject.dataBaseList.length >= 0) {
                sourceDatabaseConfig = this.targetProject.dataBaseList[0];
                sourceDatabaseConfig.databaseType = this.selectedConnection.driver;
            } else {
                vscode.window.showErrorMessage('target database is not in config.');
            }
        } else {
            sourceDatabaseConfig.databaseType = this.selectedConnection.driver;
        }
        return sourceDatabaseConfig;
    }

}