// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { GycTools } from './GycTools';
import { CodeGenerator } from './CodeGenerator';
import { FileExplorer } from './fileExplorer';
import { TemplateCompletionItemProvider } from './templateCompletionItemProvider';


// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	GycTools.Utils.inistializeTemplate(context);

	let targetProject: any = GycTools.Utils.getTargetProjectConfig(context);
	let templateExplorer: FileExplorer = new FileExplorer(context, GycTools.Utils.getTemplatePath(context, targetProject));

	let initPrject = function () {
		if (!targetProject) {
			GycTools.Utils.initializeConfigFile(context);
			targetProject = GycTools.Utils.getTargetProjectConfig(context);
			templateExplorer.reFlashRoot();
			return;
		} else { //get new config alltimes
			targetProject = GycTools.Utils.getTargetProjectConfig(context);
		}
		if (targetProject === undefined) {
			console.error('gyctool config error , extension disabled');
			vscode.window.showErrorMessage('gyctool config error , extension disabled');
			return;
		}
	};

	context.subscriptions.push(vscode.commands.registerCommand('gyctools.generateYourCodes', (item) => {
		initPrject();
		const codeGenerator: CodeGenerator = new CodeGenerator(context, item, targetProject);
		codeGenerator.generateNew();
		return;
	}));

	

}


// this method is called when your extension is deactivated
export function deactivate() { }
