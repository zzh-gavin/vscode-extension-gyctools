// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GycTools } from './GycTools';
import { CodeGenerator } from './CodeGenerator';
import { FileExplorer } from './fileExplorer';
import { DocumentGenerator } from './DocumentGenerator';
import { DataBaseCodeGenerator } from './DataBaseCodeGenerator';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	try {
		const tpConig = vscode.workspace.getConfiguration().get<string>('gyctools.templatePath','');
		let targetProject = GycTools.Utils.getTargetProjectConfig(context);
		if ( !targetProject || !targetProject.templatePath || targetProject.templatePath.length <= 0) {
			GycTools.Utils.inistializeTemplate(context,tpConig);
		}
		if (!targetProject) {
			GycTools.Utils.initializeConfigFile(context);
			targetProject = GycTools.Utils.getTargetProjectConfig(context);
		} else { //get new config alltimes
			targetProject = GycTools.Utils.getTargetProjectConfig(context);
		}
		
		let templateExplorer: FileExplorer = new FileExplorer(context, GycTools.Utils.getTemplatePath(context, targetProject));

		templateExplorer.reFlashRoot();
		if (targetProject === undefined) {
			console.error('gyctool config error , extension disabled');
			return;
		}

		// let initProject = function () {
		// 	targetProject = GycTools.Utils.getTargetProjectConfig(context);
		// };

		context.subscriptions.push(vscode.commands.registerCommand('gyctools.generateDatabaseSpecification', (item) => {
			targetProject = GycTools.Utils.getTargetProjectConfig(context);
			const docGenerator: DocumentGenerator = new DocumentGenerator(context, item, targetProject);
			docGenerator.generateNew();
			return;
		}));

        context.subscriptions.push(vscode.commands.registerCommand('gyctools.generateCodeByAllTable', (item) => {
			targetProject = GycTools.Utils.getTargetProjectConfig(context);
			const dbGenerator: DataBaseCodeGenerator = new DataBaseCodeGenerator(context, item, targetProject);
			const count = dbGenerator.generateNew();
            vscode.window.showInformationMessage('Generate ' + count + ' Code Files', 'OK');
			return;
		}));

		context.subscriptions.push(vscode.commands.registerCommand('gyctools.generateYourCodes', (item) => {
			targetProject = GycTools.Utils.getTargetProjectConfig(context);
			const codeGenerator: CodeGenerator = new CodeGenerator(context, item, targetProject);
			codeGenerator.generateNew();
			return;
		}));
	
	} catch (error) {
		console.error(error);
	}
	

}


// this method is called when your extension is deactivated
export function deactivate() { }
