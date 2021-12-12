# GYC TOOLS

This is a tool for generate your code(all programming language up to you) or maybatis map-file from database table definition.

## Extension Dependencies

### [SQLTools](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools)

If want use this tools,you must install [SQLTools](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools). It's a very popular extension for database manage.

## Database Type supported

### MySQL

Install [SQLTools](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools) and [SQLTools MySQL/MariaDB driver](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools-driver-mysql) is necessarily.And the connection setting mast use 'Server and Port' and the password need select 'Save password' if not this tool can't connect to db server.

### MsSQL

Install [SQLTools](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools) and [SQLTools MicrosoftSQL Server/Azure driver](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools-driver-mssql) is necessarily. And the connection setting mast use 'Server and Port' and the password need select 'Save password' if not this tool can't connect to db server.

## Usage

![Usage](https://gskd.sdoprofile.com/schema/gyctools.gif)

## Features

* generate all language from db table by [Nunjucks](https://github.com/mozilla/nunjucks) template

* two kind instance take part in the Nunjucks template.
  * CodeEntity is db table info, the properties can used in your template:

  ``` typescript
    //database type , currently we only support MySQL.this fiedl value samed with SQLTools driver name.
    dbType: String;
    //original table name from db
    tableName: string;
    //conversion from tableName
    className: string;
    //table's primary key 
    primaryKey?: string;
    //table's auto increment column name
    autoIncrementKey?: string;
    //conversion from table columns 
    properties: Array<CodeProperty>;    
    //if the column conversion need import code, see TypeInterpreter Config
    importArray: Array<string> = new Array<string>();
    //custom attributes from config file
    customsAttributes: any;   
    //table name prefix from config file
    tableNamePrefix: string;
  ```

  * CodeProperty is table columns info, the properties can used in your template by {{properties}}:
  
  ``` typescript
    columnName: string;
    dataType: string;
    isNullable: string;
    comment: string;
    propertyName: string;
    propertyType?: string;
    methodName: string;
    isAutoIncrement: boolean;
    importTypeName?: string;
    isInBaseModel: boolean = false;
    isPrimaryKey: boolean = false;
  ```

## Extension Config File Manual

When tools activated,it will read tool config from "./vscode/gyctools.config.json". This section will told you how to make it or you can see the [config schema](https://gskd.sdoprofile.com/schema/gyctools.config.schema.json)

## Code Template Info

Tools has a bundle of templates in extension installation directory "template-sqg-spring",it's a java-spring and a private template demo you to edit them for youself style. Alternatively,you can contact us for help. And then you can set the template folder in gyctools.config by "dataBaseList.item.templatePath".

### Language Type Interpreter

Gyc tool has tow type interpreter provided:
If that is not what your want,then can define a 'customsTypeInterpreterConfig' in 'gyctools.config.json' like the 'gyctools.config.json Demo'.

* MySqlToJavaTypeInterpreter

  ``` typescript
   static dbTypeToJavaTypeInterpreterConfig: any = {
        'int': { 'result': 'Integer' },
        'tinyint': { 'result': 'Integer' },
        'smallint': { 'result': 'Integer' },
        'datetime': { 'result': 'Date', 'importTypeName': 'java.util.Date' },
        'timestamp': { 'result': 'Date', 'importTypeName': 'java.util.Date' },
        'date': { 'result': 'Date', 'importTypeName': 'java.util.Date' },
        'time': { 'result': 'Date', 'importTypeName': 'java.util.Date' },
        'decimal': { 'result': 'BigDecimal', 'importTypeName': 'java.math.BigDecimal' },
        'bit': { 'result': 'Boolean' },
        'bigint': { 'result': 'Long' },
        'default': { 'result': 'String' }
    };
  ```

* MsSqlToJavaTypeInterpreter

  ``` typescript
   static dbTypeToJavaTypeInterpreterConfig: any = {
        'int': { 'result': 'Integer' },
        'tinyint': { 'result': 'Integer' },
        'smallint': { 'result': 'Integer' },     
        'datetime': { 'result': 'Date', 'importTypeName': 'java.util.Date' },
        'smalldatetime': { 'result': 'Date', 'importTypeName': 'java.util.Date' },
        'timestamp': { 'result': 'Date', 'importTypeName': 'java.util.Date' },
        'date': { 'result': 'Date', 'importTypeName': 'java.util.Date' },
        'time': { 'result': 'Date', 'importTypeName': 'java.util.Date' },
        'decimal': { 'result': 'BigDecimal', 'importTypeName': 'java.math.BigDecimal' },
        'numeric': { 'result': 'BigDecimal', 'importTypeName': 'java.math.BigDecimal' },
        'money': { 'result': 'BigDecimal', 'importTypeName': 'java.math.BigDecimal' },
        'bit': { 'result': 'Boolean' },
        'bigint': { 'result': 'Long' },
        'default': { 'result': 'String' }
    };
  ```

### gyctools.config.json Demo

``` json
{
    "$schema": "https://gskd.sdoprofile.com/schema/gyctools.config.schema.v2.json",
    "projectName": "gvctoolsdemo",
    "projectPath": "gvctoolsdemo",
    "enabled": true,    
    "openFileWhenComplete": false,
    "templatePath":"",
    "dataBaseList": [
        {
            "dataBaseName": "gyc_tools",
            "tableNamePrefix": "TB_",
            "templateList": [
                {
                    "templateName": "model.njk",
                    "outFileType": ".java",
                    "outPath": "/gvctoolsdemo-model/src/main/java/com/sqg/model/",
                    "enabled": true
                },
                {
                    "templateName": "reader.njk",
                    "outFileType": "Reader.java",
                    "outPath": "/gvctoolsdemo-model/src/main/java/com/sqg/reader/",
                    "enabled": true
                },
                {
                    "templateName": "reader_map.njk",
                    "outFileType": ".xml",
                    "outPath": "/gvctoolsdemo-model/src/main/resources/mappers/reader/",
                    "enabled": true
                },
                {
                    "templateName": "writer.njk",
                    "outFileType": "Writer.java",
                    "outPath": "/gvctoolsdemo-model/src/main/java/com/sqg/writer/",
                    "enabled": true
                },
                {
                    "templateName": "writer_map.njk",
                    "outFileType": ".xml",
                    "outPath": "/gvctoolsdemo-model/src/main/resources/mappers/writer/",
                    "enabled": true
                },
                {
                    "templateName": "service.njk",
                    "outFileType": "Service.java",
                    "outPath": "/gvctoolsdemo-service/src/main/java/com/sqg/service/",
                    "enabled": true
                },
                {
                    "templateName": "service_impl.njk",
                    "outFileType": "ServiceImpl.java",
                    "outPath": "/gvctoolsdemo-service/src/main/java/com/sqg/service/impl/",
                    "enabled": true
                }
            ],
            "customsAttributes": {
                "modelPackageName": "com.sqg.model",
                "readerPackageName": "com.sqg.reader",
                "writerPackageName": "com.sqg.writer",
                "servicePackageName": "com.sqg.service",
                "serviceImplPackageName": "com.sqg.service.impl"
            },
            "customsTypeInterpreterConfig": {
                "int": {
                    "result": "Integer"
                },
                "tinyint": {
                    "result": "Integer"
                },
                "smallint": {
                    "result": "Integer"
                },
                "varchar": {
                    "result": "String"
                },
                "datetime": {
                    "result": "Date",
                    "importTypeName": "java.util.Date"
                },
                "timestamp": {
                    "result": "Date",
                    "importTypeName": "java.util.Date"
                },
                "date": {
                    "result": "Date",
                    "importTypeName": "java.util.Date"
                },
                "time": {
                    "result": "Date",
                    "importTypeName": "java.util.Date"
                },
                "decimal": {
                    "result": "BigDecimal",
                    "importTypeName": "java.math.BigDecimal"
                },
                "bit": {
                    "result": "Boolean"
                },
                "bigint": {
                    "result": "Long"
                },
                "default": {
                    "result": "String"
                }
            }
        }
    ],
    "baseModelProperties": [
        "id",
        "dr",
        "dataVersion",
        "createTime",
        "updateTime"
    ]
}
```

### Config Schema

you also can add config schema relation by vscode setting eg "json.schemas"::

``` json

    {
        "fileMatch": [
            "gyctools.config.json"
        ],
        "url": "https://gskd.sdoprofile.com/schema/gyctools.config.schema.v2.json"
    }
    
```
