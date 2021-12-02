// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { Connection } from 'mysql';

export namespace GycTools {

	export class Utils {

		public static initializeConfigFile(context: vscode.ExtensionContext): void {
			const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
			? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined; 
			if(!rootPath){
				console.error('gyctool config error , extension disabled');
				vscode.window.showErrorMessage('workspace folders not found');
				return;
			}
			let defaultConfigFile = path.join(context.extensionPath ,'gyctools.config.json');
			let targetFilePath = path.join(rootPath,Constants.projectConfigPath,Constants.configFileName);
			fs.copyFileSync(defaultConfigFile,targetFilePath);
			vscode.window.showErrorMessage("please set the gyctools config for your self");
			vscode.window.showTextDocument(vscode.Uri.file(targetFilePath),{viewColumn: vscode.ViewColumn.One});
			return;
		}

		public static getColumnInfo(connect:Connection,sqlCommand : string):Promise<any>{
			return new Promise(function (resolve, reject) {
				connect.query(sqlCommand,(error, result) => {
					if(error){
						reject(error);
					}else{
						resolve(result);
					}
				});
			}); 
		}

	}

	export class Constants {
		static configFileName = 'gyctools.config.json';

		static projectConfigPath = '.vscode';

		static defaultTemplateDirectory = 'template_sqg_spring';
	}

	export interface ProjectConfig {
		projectName:string;

		projectPath:string;

		enabled:boolean;

		baseModelProperties:Array<string>;

		openFileWhenComplete:boolean;

		dataBaseList:Array<DatabaseConfig>;

		hasConfigFile: boolean;

		projectFullPath:string;
	}

	export interface DatabaseConfig{

		dataBaseName: string;

		tableNamePrefix: string;

		customsAttributes: Map<string,string>;

		customsTypeInterpreterConfig: Map<string,any>;

		templateList:Array<any>;

		databaseType: string;

		templatePath: string;

	}

}
