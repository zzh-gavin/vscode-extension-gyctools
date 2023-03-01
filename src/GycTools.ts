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

		public static getTargetProjectConfig(context: vscode.ExtensionContext): ProjectConfig {
			let targetProject: ProjectConfig;
			vscode.workspace.workspaceFolders?.forEach((f) => {
				var configFile = path.join(f.uri.fsPath, GycTools.Constants.projectConfigPath, GycTools.Constants.configFileName);
				if (fs.existsSync(configFile)) {
					var configString = fs.readFileSync(configFile).toString();
					let projectConfig: GycTools.ProjectConfig = JSON.parse(configString);
					if (projectConfig && projectConfig.enabled === true) {
						targetProject = projectConfig;
						targetProject.projectFullPath = f.uri.fsPath;
						const tpConig = vscode.workspace.getConfiguration().get<string>('gyctools.templatePath','');
						if( targetProject && ( !targetProject.templatePath || targetProject.templatePath.length<=0)){
							targetProject.templatePath = tpConig;
						}
						return;
					}
				}
			});
			return targetProject;
		}

		public static inistializeTemplate(context: vscode.ExtensionContext,tpConfig:string): void {
			if(!tpConfig || tpConfig.trim().length<=0){
				const sourcePath = path.join(context.extensionPath, GycTools.Constants.defaultTemplateDirectory);
				const targetPath = GycTools.Utils.getDefaultTmplatePath();
				if (!fs.existsSync(targetPath)) {
					fs.mkdirSync(targetPath, { recursive: true });
					GycTools.Utils.copyFiles(sourcePath,targetPath);
				}
			}
		}

		public static copyFiles(sourcePath:fs.PathLike,targetPath:fs.PathLike){
			let files = fs.readdirSync(sourcePath, { withFileTypes: true });
			files.forEach((file) => {
				if(file.isFile()){
					fs.copyFileSync(path.join(sourcePath.toString(), file.name), path.join(targetPath.toString(), file.name));
				}else{
					const newTargetPath = path.join(targetPath.toString(), file.name);
					if (!fs.existsSync(newTargetPath)) {
						fs.mkdirSync(newTargetPath, { recursive: true });
						GycTools.Utils.copyFiles(path.join(sourcePath.toString(), file.name), newTargetPath);
					}
				}
			});
		}

		public static getDefaultTmplatePath():string {
			const targetPath = path.join(vscode.workspace.workspaceFolders[0].uri.fsPath,'.vscode','gyc_templates');
			return targetPath;
		}

		public static getTemplatePath(context: vscode.ExtensionContext, targetProjectConfig: ProjectConfig): string {
			if (targetProjectConfig && targetProjectConfig.templatePath && targetProjectConfig.templatePath.length > 0) {
				return targetProjectConfig.templatePath;
			} else {
				const tpConig = vscode.workspace.getConfiguration().get<string>('gyctools.templatePath','');
				if(tpConig && tpConig.length>0){
					return tpConig;
				}else{
					return GycTools.Utils.getDefaultTmplatePath();
				}
			}
		}

		public static initializeConfigFile(context: vscode.ExtensionContext): void {
			const rootPath = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
				? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
			if (!rootPath) {
				console.error('gyctools config error , extension disabled');
				vscode.window.showErrorMessage('workspace folders not found');
				return;
			}
			const defaultConfigFile = path.join(context.extensionPath,  Constants.configFileName);
			const targetFilePath = path.join(rootPath, Constants.projectConfigPath, Constants.configFileName);
            const configSchema =  path.join(context.extensionPath, Constants.schemaFileName);
            const configSchemaTarget = path.join(rootPath, Constants.projectConfigPath, Constants.schemaFileName);

			fs.copyFileSync(defaultConfigFile, targetFilePath);
            fs.copyFileSync(configSchema, configSchemaTarget);
			vscode.window.showInformationMessage("Please set the gyctools config for new project.");
			vscode.window.showTextDocument(vscode.Uri.file(targetFilePath), { viewColumn: vscode.ViewColumn.One });
			return;
		}

		

	}

	export class Constants {
        static myName = 'patella';

		static configFileName = 'gyctools.config.json';

        static schemaFileName = 'gyctools.config.schema.json';

		static projectConfigPath = '.vscode';

		static defaultTemplateDirectory = 'gyc_templates';

		static defaultTemplateUserDirectory = ".gyctools_templates";

		// eslint-disable-next-line @typescript-eslint/naming-convention
		static MSG_CONNECTION_ERROR_NO_SERVER = 'Db Connection Config Error. Must use server & port style.';

		// eslint-disable-next-line @typescript-eslint/naming-convention
		static MSG_CONNECTION_ERROR_NO_USER = 'Db Connection Config Error. Must use server & port style.And must save passord';

        static holdingReg: RegExp = /^\s*\W*\s*patella\:holding\s+codes\s+name\s*=\s*(\w+).*$\s*((:?.|\r|\n)+)\r$\s*^(^.*patella:end\s+holding\s+codes\s*\W*$)/m;

        static holdingEndRegs:RegExp = /(^.*patella:end\s+holding\s+codes.*$)/m;
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

		overrideMode:"all"|"portion";
	}

	export interface DatabaseConfig {

		dataBaseName: string;

		tableNamePrefix: string;

		customsAttributes: Map<string, string>;

		customsTypeInterpreterConfig: Map<string, any>;

		templateList: Array<any>;

		databaseType: string;

	}

	export interface TableInfo{
		databaseName:String;
		databaseType:String;
		tableName:String;
		comment:String;
		columnInfos:Array<TableColumnInfo>;
		pkCount
	}

	export interface TableColumnInfo{
		position:number;
		databaseName:string;
		tableName:string;
		columnName:string;
		dataType:string;
		isNullable:boolean;
		comment:string;
		isPk:boolean;
		isAutoIncrement:boolean;
		columnType:string;
		defaultValue:string;
	}

	export interface DataQuerier {
		databaseType: 'MySQL' | 'MsSQL' | string ;
		databaseName: string;
		tableName: string;
		getTableColumnInfo(tableName:String): Promise<Array<GycTools.TableColumnInfo>>;
		getTableArray(): Promise<Array<GycTools.TableInfo>>;
		close():void;
        getTableInfo(tableName:String): Promise<GycTools.TableInfo>;
	}

	export interface TemplateInfo{
		templateName:string;
		outFileType:string;
		outPath:string;
		enabled:boolean;
		language:string;
		customsTypeInterpreterConfig: Map<string, any>;
	}

}
