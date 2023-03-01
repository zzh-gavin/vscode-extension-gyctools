import * as vscode from 'vscode';
import { GycTools } from './GycTools';
import { dataQuerierFactory } from './DataSource';
import { CodeGenerator } from './CodeGenerator';

export class DataBaseCodeGenerator {

    static portionReg:RegExp = /^.*begin-gyc-code-portion\s+(?:.|\n|\r)*end-gyc-code-portion.*$/m ;
    selectedConnection: any;
    selectedDataBase: string;
    selectedTableName: string;
    context: vscode.ExtensionContext;
    hasConfigFileInWorkspace: boolean = false;
    targetProject: GycTools.ProjectConfig;
    sourceDatabaseConfig: GycTools.DatabaseConfig;
    selectedItem :any ;


    readonly dataQuerier: GycTools.DataQuerier;

    constructor(context: vscode.ExtensionContext, selectedItem: any, targetProject: GycTools.ProjectConfig) {
        this.context = context;
        this.selectedTableName = selectedItem.value;
        this.selectedDataBase = selectedItem.metadata.database;
        this.targetProject = targetProject;
        this.dataQuerier = dataQuerierFactory(selectedItem);
        this.selectedItem = selectedItem;
    }

    generateNew():number {
        var count = 0 ;
        this.dataQuerier.getTableArray().then(async t => {
            for(var tt of t){
                var newItem = JSON.parse(JSON.stringify(this.selectedItem)); 
                newItem.value = tt.tableName ;
                newItem.conn = newItem.parent.conn;
                const docGenerator: CodeGenerator = new CodeGenerator(this.context, newItem, this.targetProject,true);
                count = count + docGenerator.generateNew();
            }
        }).catch((error) => {
            console.error(error);
            vscode.window.showErrorMessage(error.message);
        }).finally(() => {
            this.dataQuerier.close();
        });

        return count;
    }

}