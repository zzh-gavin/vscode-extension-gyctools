import * as vscode from 'vscode';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import * as fs from 'fs';
import { CodeEntity } from './CodeEntity';
import { GycTools } from './GycTools';
import { dataQuerierFactory } from './DataSource';

export class DocumentGenerator {

    selectedConnection: any;
    selectedDataBase: string;
    context: vscode.ExtensionContext;
    hasConfigFileInWorkspace: boolean = false;
    targetProject: GycTools.ProjectConfig;
    sourceDatabaseConfig: GycTools.DatabaseConfig;


    readonly dataQuerier: GycTools.DataQuerier;

    constructor(context: vscode.ExtensionContext, selectedItem: any, targetProject: GycTools.ProjectConfig) {
        this.context = context;
        this.selectedDataBase = selectedItem.metadata.database;
        this.targetProject = targetProject;
        this.dataQuerier = dataQuerierFactory(selectedItem);
        this.sourceDatabaseConfig = this.getSourceDatabase();
    }

    generateNew() {
        let templateDir = GycTools.Utils.getTemplatePath(this.context, this.targetProject);
        if (!fs.existsSync(templateDir)) {
            vscode.window.showErrorMessage('template dir error');
            return;
        }
        this.dataQuerier.getTableArray().then(async t => {
            for(var tt of t){
                await this.dataQuerier.getTableColumnInfo(tt.tableName).then(cInfo => {
                    tt.columnInfos = cInfo;
                }).catch((ee)=>{
                    vscode.window.showErrorMessage(ee);
                    console.log(ee);
                });
            }
            const date = new Date();
            const dateString = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'medium'}).format(date);
            var dataBaseInfo: any = {databaseName:this.dataQuerier.databaseName,tableList:t,gDate:dateString};
            const templatePath = path.join(templateDir,"specification.njk");

            nunjucks.configure(path.dirname(templatePath), { autoescape: false, trimBlocks: true, lstripBlocks: true }); //config template path
            const renderString = nunjucks.render(path.basename(templatePath), dataBaseInfo); //render code
            const outDirectory = path.join(this.targetProject.projectFullPath, ".vscode");
            if (!fs.existsSync(outDirectory)) {
                fs.mkdirSync(outDirectory, { recursive: true });
            }
            const outFliePath = path.join(outDirectory, `${dataBaseInfo.databaseName}.html`);
            fs.writeFileSync(outFliePath, renderString);
        });

        vscode.window.showInformationMessage('Generate DB Specification Successed', 'OK');
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