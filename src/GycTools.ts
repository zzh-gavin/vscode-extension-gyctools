// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

export namespace GycTools {

	export class Utils {

		public static checkConnectionConfig(conn:GycTools.ConnectionConfig):boolean{
			if(!conn.server || conn.server.length < 1){
                console.error(GycTools.Constants.MSG_CONNECTION_ERROR_NO_SERVER);
                vscode.window.showErrorMessage(GycTools.Constants.MSG_CONNECTION_ERROR_NO_SERVER);
				return false;
            }
            if(!conn.port || conn.port < 1){
                console.error(GycTools.Constants.MSG_CONNECTION_ERROR_NO_SERVER);
                vscode.window.showErrorMessage(GycTools.Constants.MSG_CONNECTION_ERROR_NO_SERVER);
				return false;
            }
			if(!conn.username || conn.username.length < 1){
                console.error(GycTools.Constants.MSG_CONNECTION_ERROR_NO_USER);
                vscode.window.showErrorMessage(GycTools.Constants.MSG_CONNECTION_ERROR_NO_USER);
				return false;
            }
			if(!conn.password || conn.password.length < 1){
                console.error(GycTools.Constants.MSG_CONNECTION_ERROR_NO_USER);
                vscode.window.showErrorMessage(GycTools.Constants.MSG_CONNECTION_ERROR_NO_USER);
				return false;
            }
			return true;
		}

		public static getTargetProjectConfig(context: vscode.ExtensionContext): any {
			let targetProject: ProjectConfig;
			vscode.workspace.workspaceFolders?.forEach((f) => {
				var configFile = path.join(f.uri.fsPath, GycTools.Constants.projectConfigPath, GycTools.Constants.configFileName);
				if (fs.existsSync(configFile)) {
					var configString = fs.readFileSync(configFile).toString();
					let projectConfig: GycTools.ProjectConfig = JSON.parse(configString);
					if (projectConfig && projectConfig.enabled === true) {
						targetProject = projectConfig;
						targetProject.projectFullPath = f.uri.fsPath;
						return;
					}
				}
			});
			return targetProject;
		}

		public static inistializeTemplate(context: vscode.ExtensionContext): void {
			const sourcePath = path.join(context.extensionPath, GycTools.Constants.defaultTemplateDirectory);
			const targetPath = path.join(os.homedir(), GycTools.Constants.defaultTemplateUserDirectory);
			if (!fs.existsSync(targetPath)) {
				fs.mkdirSync(targetPath, { recursive: true });
				let files = fs.readdirSync(sourcePath);
				files.forEach((f) => {
					fs.copyFileSync(path.join(sourcePath, f), path.join(targetPath, f));
				});
			}
		}

		public static getTemplatePath(context: vscode.ExtensionContext, targetProjectConfig: ProjectConfig): string {
			if (targetProjectConfig && targetProjectConfig.templatePath && targetProjectConfig.templatePath.length > 0) {
				return targetProjectConfig.templatePath;
			} else {
				return path.join(os.homedir(), GycTools.Constants.defaultTemplateUserDirectory);
				//return path.join(context.extensionPath, GycTools.Constants.defaultTemplateDirectory);
			}
		}

		public static initializeConfigFile(context: vscode.ExtensionContext): void {
			const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
				? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
			if (!rootPath) {
				console.error('gyctool config error , extension disabled');
				vscode.window.showErrorMessage('workspace folders not found');
				return;
			}
			let defaultConfigFile = path.join(context.extensionPath, 'gyctools.config.json');
			let targetFilePath = path.join(rootPath, Constants.projectConfigPath, Constants.configFileName);
			fs.copyFileSync(defaultConfigFile, targetFilePath);
			vscode.window.showErrorMessage("please set the gyctools config for your self");
			vscode.window.showTextDocument(vscode.Uri.file(targetFilePath), { viewColumn: vscode.ViewColumn.One });
			return;
		}

		

	}

	export class Constants {
		static configFileName = 'gyctools.config.json';

		static projectConfigPath = '.vscode';

		static defaultTemplateDirectory = 'template_sqg_spring';

		static defaultTemplateUserDirectory = ".gyctools_templates";

		// eslint-disable-next-line @typescript-eslint/naming-convention
		static MSG_CONNECTION_ERROR_NO_SERVER = 'Db Connection Config Error. Must use server & port style.';

		// eslint-disable-next-line @typescript-eslint/naming-convention
		static MSG_CONNECTION_ERROR_NO_USER = 'Db Connection Config Error. Must use server & port style.And must save passord';

	}

	export interface ConnectionConfig{
		server:string;
		port: number;
		username:string;
		password:string;
		database:string;
		mssqlOptions:any;
		domain:string;
	}

	export interface ProjectConfig {
		projectName: string;

		projectPath: string;

		enabled: boolean;

		baseModelProperties: Array<string>;

		openFileWhenComplete: boolean;

		dataBaseList: Array<DatabaseConfig>;

		hasConfigFile: boolean;

		projectFullPath: string;

		templatePath: string;

		overrideExists:boolean;
	}

	export interface DatabaseConfig {

		dataBaseName: string;

		tableNamePrefix: string;

		customsAttributes: Map<string, string>;

		customsTypeInterpreterConfig: Map<string, any>;

		templateList: Array<any>;

		databaseType: string;

	}

	export interface TableColumnInfo{
		databaseName:string;
		tableName:string;
		columnName:string;
		dataType:string;
		isNullable:boolean;
		comment:string;
		isPk:boolean;
		isAutoIncrement:boolean;
	}

	export interface ColumnQuerier {
		databaseType: 'MySQL' | 'MsSQL' | string ;
		databaseName: string;
		tableName: string;
		getTableColumnInfo(): Promise<Array<GycTools.TableColumnInfo>>
		close():void;
	}

}
