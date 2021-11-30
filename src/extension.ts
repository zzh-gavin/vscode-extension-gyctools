// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as mysql from 'mysql';
import * as nunjucks from 'nunjucks';
import * as path from 'path';
import * as fs from 'fs';
import { CodeEntity } from './CodeEntity';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('gyctools.generateYourCodes', (item) => {

		const tableName = item.value;
		const dataBaseName = item.parent.parent.value;
		const conn = item.conn;

		const connect = mysql.createConnection({
			host: conn.server,
			port: conn.port,
			user: conn.username,
			password: conn.password,
			database: conn.database
		});

		let defaultProject: any;
		let rootPath: string;
		vscode.workspace.workspaceFolders?.forEach((f) => {
			var configFile = path.join(f.uri.fsPath, '.vscode/gyctools.config.json');
			if (fs.existsSync(configFile)) {
				var configString = fs.readFileSync(configFile).toString();
				var projectConfig = JSON.parse(configString);
				if (projectConfig) {
					if (projectConfig.enabled === true) {
						defaultProject = projectConfig;
						rootPath = f.uri.fsPath;
						return;
					}
				}
			}
		});

		if (!defaultProject) {
			console.error('gyctool config error , extension disabled');
			vscode.window.showErrorMessage('gyctool config error , extension disabled');
			return;
		}

		const dataBaseConfig: any[] = defaultProject.dataBaseList;
		let currentDataBaseConfig = dataBaseConfig.filter((e) => { return e.dataBaseName === dataBaseName; })[0];
		currentDataBaseConfig.dataBaseType = conn.driver;
		//console.log('get database config：', currentDataBaseConfig);

		if (!currentDataBaseConfig) {
			vscode.window.showErrorMessage('target database is not in config.');
			return;
		}
		let temlpateList: any[] = currentDataBaseConfig.templateList; //get templates list config
		temlpateList = temlpateList.filter((e) => { return e.enabled === undefined || e.enabled === true; });
		//console.log(temlpateList);

		let gentFileCount = 0;
		const sqlCommand = `SELECT * FROM information_schema.COLUMNS where TABLE_NAME = '${tableName}' AND TABLE_SCHEMA ='${dataBaseName}' `;
		connect.connect();
		connect.query(sqlCommand, (error, result, fields) => {
			let codeEntity = new CodeEntity(conn.driver,tableName, result, defaultProject.baseModelProperties, currentDataBaseConfig);
			//console.log(codeEntity);

			//get template path
			let templatePath = path.join(context.extensionPath, 'template_sqg_spring');
			if (currentDataBaseConfig.templatePath && currentDataBaseConfig.templatePath.length > 0) {
				templatePath = path.join(currentDataBaseConfig.templatePath);
			}
			if (!fs.existsSync(templatePath)) {
				vscode.window.showErrorMessage('template path error');
				return;
			}
			nunjucks.configure(templatePath, { autoescape: false }); //config template path

			temlpateList.forEach((t) => {
				codeEntity.template = t;
				const renderString = nunjucks.render(t.templateName, codeEntity); //render code
				const outFliePath = path.join(rootPath, t.outPath, `${codeEntity.className}` + t.outFileType);//generate code file
				fs.writeFileSync(outFliePath, renderString);
			});

			vscode.window.showInformationMessage('gyctools:generate successfully');
		});
		connect.end;
		
	}));

}

// this method is called when your extension is deactivated
export function deactivate() { }
