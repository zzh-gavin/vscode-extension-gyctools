// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { GycTools } from './GycTools';
import { CodeGenerator } from './CodeGenerator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('gyctools.generateYourCodes', (item) => {

		let targetProject: any;
		let hasConfigFile = false;
		vscode.workspace.workspaceFolders?.forEach((f) => {
			var configFile = path.join(f.uri.fsPath, GycTools.Constants.projectConfigPath, GycTools.Constants.configFileName);
			if (fs.existsSync(configFile)) {
				hasConfigFile = true;
				var configString = fs.readFileSync(configFile).toString();
				let projectConfig:GycTools.ProjectConfig = JSON.parse(configString);
				if (projectConfig && projectConfig.enabled === true) {
					targetProject = projectConfig;
					targetProject.projectFullPath = f.uri.fsPath;
					return;					
				}
			}
		});

		if (hasConfigFile === false) {
			GycTools.Utils.initializeConfigFile(context);
			return;
		}

		if (targetProject === undefined) {
			console.error('gyctool config error , extension disabled');
			vscode.window.showErrorMessage('gyctool config error , extension disabled');
			return;
		}

		let codeGenerator:CodeGenerator = new CodeGenerator(context,item,targetProject);
		codeGenerator.generate();
		return ;

	}));

}

// this method is called when your extension is deactivated
export function deactivate() { }
