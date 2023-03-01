# Change Log
## [1.3.2]
- CodeEntity add property "tableComment".
- Discard import type when the column in "baseModelProperties" configration.

## [1.3.0]

- Rename to Patella
- Add new selectable option on database menu item "Patella->Generate Codes(ALL TABLE)".
- "Generate Codes(ALL TABLE)" feature is used for initialize your codes by all tables from selected DB,if the target code file is not exists.
  So,if the target code file is exists,only "Patella->Generate Codes" on table's menu to regenerate it.
- New holding range grammar to reserve owner manual codes. 
- Portion feature was disabled.

## [1.2.3]

- CodeEntity add new properties : primarykeyProperties,primaryKeyCount

## [1.2.0]

- Add a database specification template and provide a command on database view for generate database document.
- Database specification template only support mysql now.

## [1.1.4]

- Change config file initialize, when vocode is openning.

## [1.1.2]

- Add an extensional configuration 'templatePath' for default.And will not to copy default templates in '.vscode' when it is setting.  
  
## [1.1.1]

- Fix issue: If had setting project's template path , cancel copy the default templates into .vscode folder.

## [1.1.0]

- Add new templates for TypeScript\CSharp\Java
- Add new template config feature with customsTypeInterpreterConfig.Then every template can define is's own language interpreter.

## [1.0.6]

- New feature: generate codes in portion.

## [1.0.5]

- Fix issue: Selected database not working.

## [1.0.1]

- Project config add feature:overrideExists.

## [1.0.0]

- Rename to "EasyProducer GycTools".

## [0.1.5]

- Add extension dependency : nunjucks-template. It's for njk template edit help.
- Add completions from gyc tools attributers. This feature will be activated when open njk templates from the GYC TOOLS TEMPLATE EXPORER.
- Update gyctools.config.schema.json v1 to v2.Plese update schema link in config file.

## [0.1.3]

- Bug fix.
- Update readme.

## [0.1.2]

- Add mssql supported.

## [0.1.1]

- Initialize default templates to users homedir.
- Change Nunjucks trim config:false to ture ,so remove the blank control punctuation('-') from templates.
- Add extension dependency:mtxr.sqltools-driver-mysql.

## [0.1.0]

- Add Template explorer view.
- Move ProjectConfig.dataBaseConfig.templatePath to ProjectConfig.templatePath.
- fix other issue.

## [0.0.4]

- Check file directory and auto create it if not exists.
- And project configration "openFileWhenComplete"

## [0.0.3]

- Initial release
