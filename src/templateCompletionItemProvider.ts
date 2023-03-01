import * as vscode from 'vscode';
import { GycTools } from './GycTools';

export class TemplateCompletionItemProvider implements vscode.CompletionItemProvider {

    arrayTypes: Array<string> = ['properties', 'importArray'];
    projectConfig: GycTools.ProjectConfig;

    objectTypes: Map<string, string[]> = new Map([
        ['properties', ['columnName', 'dataType', 'isNullable', 'comment', 'propertyName', 'propertyType', 'methodName'
            , 'isAutoIncrement', 'isInBaseModel', 'isPrimaryKey']]
    ]);

    constructor(projecConfig: GycTools.ProjectConfig) {
        this.projectConfig = projecConfig;
    }

    public provideCompletionItems(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext): vscode.ProviderResult<vscode.CompletionItem[] | vscode.CompletionList<vscode.CompletionItem>> {
        if (document.lineAt(position).text.indexOf('for ') > 0) {
            return [
                new vscode.CompletionItem('properties', vscode.CompletionItemKind.Class),
                new vscode.CompletionItem('importArray', vscode.CompletionItemKind.Class),
            ];
        } else {
            if (context.triggerCharacter === '.') {
                if (this.checkTiggerWord(document, position, 'customsAttributes')) {
                    return this.getCustomsAttributesItem();
                }else{
                    const forArray = this.checkIsForParam(document, position);
                    if (forArray) {
                        if (context.triggerCharacter === '.') {
                            const values = this.objectTypes.get(forArray);
                            if (values) {
                                let result: vscode.CompletionItem[] = [];
                                for (const v of values) {
                                    result.push(new vscode.CompletionItem(v, vscode.CompletionItemKind.Value));
                                }
                                return result;
                            }
                        }
                    }else{
                        return this.returnNumallItem();
                    }
                }
            }
            else {
                return this.returnNumallItem();
            }
        }
    }

    private returnNumallItem():vscode.CompletionItem[]{
        return [
            new vscode.CompletionItem('dbType', vscode.CompletionItemKind.Value),
            new vscode.CompletionItem('tableName', vscode.CompletionItemKind.Value),
            new vscode.CompletionItem('className', vscode.CompletionItemKind.Value),
            new vscode.CompletionItem('primaryKey', vscode.CompletionItemKind.Value),
            new vscode.CompletionItem('autoIncrementKey', vscode.CompletionItemKind.Value),
            new vscode.CompletionItem('customsAttributes', vscode.CompletionItemKind.Class)
        ];
    }

    private checkTiggerWord(document: vscode.TextDocument, position: vscode.Position, word: string): boolean {
        return word === document.lineAt(position).text.substring(position.character - 1 - word.length, position.character - 1);
    }

    private checkIsForParam(document: vscode.TextDocument, position: vscode.Position): string {
        let regFor = /\{%+\s*for/;
        let regEndFor =/\{%+\s*endfor+\s*%}/;
        for (let i = position.line; i > 0; i--) {
            if (document.lineAt(i).text.search(regEndFor) > 0) {
                return undefined;
            }else if (document.lineAt(i).text.search(regFor) > 0) {
                if (document.lineAt(i).text.split('in').length > 1) {
                    const inString = document.lineAt(i).text.split('in')[1];
                    return this.getArrayTypeFromIn(inString);
                }else{
                    return undefined;
                }
            }
        }
        return undefined;
    }

    private getArrayTypeFromIn(inString: string): string {
        for (const a of this.arrayTypes) {
            if (inString.indexOf(a) > 0) {
                return a;
            }
        }
        return undefined;
    }

    private getCustomsAttributesItem(): vscode.CompletionItem[] {
        var attr: string[] = this.getCustomsAttributes(this.projectConfig);
        if (attr && attr.length > 0) {
            let array: vscode.CompletionItem[] = [];
            attr.forEach((s) => {
                array.push(new vscode.CompletionItem(s, vscode.CompletionItemKind.Value));
            });
            return array;
        }
        return undefined;
    }

    private getCustomsAttributes(projectConfig: GycTools.ProjectConfig): string[] {
        if (projectConfig && projectConfig.dataBaseList && projectConfig.dataBaseList.length > 0) {
            let attributes: string[] = [];
            for (var db of projectConfig.dataBaseList) {
                if (db.customsAttributes) {
                    Object.keys(db.customsAttributes).forEach((key) => {
                        if (attributes.indexOf(key) === -1) {
                            attributes.push(key);
                        }
                    });
                }
            }
            if (attributes.length > 0) {
                return attributes;
            }
        }
        return undefined;
    }
}