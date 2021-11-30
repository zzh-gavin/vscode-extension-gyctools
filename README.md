# GYC TOOLS

This is a tool for generate your code from database table definition.Currently we only support MySQL.

## Extension Dependencies

### [SQLTools](https://github.com/mtxr/vscode-sqltools.git)

If want use this tools,you must install [SQLTools](https://github.com/mtxr/vscode-sqltools.git). It's a very popular database manage vs-extension.

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

when tools activating,is will read project config info from "./vscode/gyctools.config.json". This section will told you how to make it or you can see the [config schema](https://gskd.sdoprofile.com/schema/gyctools.config.schema.json)

## Code Template Info

Tools has a bundle of templates in extension installation directory "template-sqg-spring",it's a java-spring and a private template demo you to edit them for youself style. Alternatively,you can contact us for help. And then you can set the template folder in gyctools.config by "dataBaseList.item.templatePath".

### gyctools.config.json Demo

``` json
{
    "$schema": "https://gskd.sdoprofile.com/schema/gyctools.config.schema.v1.json",
    "projectName": "gvctoolsdemo",
    "projectPath": "gvctoolsdemo",
    "enabled": true,    
    "baseModelProperties": [
        "id",
        "dr",
        "dataVersion",
        "createTime",
        "updateTime"
    ],
    "dataBaseList": [
        {
            "dataBaseName": "gyc_tools",
            "tableNamePrefix": "TB_",
            "customsAttributes": {
                "modelPackageName": "com.sqg.model",
                "readerPackageName": "com.sqg.reader.config",
                "writerPackageName": "com.sqg.writer.config",
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
            },
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
                    "outPath": "/gvctoolsdemo-model/src/main/java/com/sqg/reader/config/",
                    "enabled": true
                },
                {
                    "templateName": "reader_map.njk",
                    "outFileType": ".xml",
                    "outPath": "/gvctoolsdemo-model/src/main/resources/mappers/reader/config/",
                    "enabled": true
                },
                {
                    "templateName": "writer.njk",
                    "outFileType": "Writer.java",
                    "outPath": "/gvctoolsdemo-model/src/main/java/com/sqg/writer/config/",
                    "enabled": true
                },
                {
                    "templateName": "writer_map.njk",
                    "outFileType": ".xml",
                    "outPath": "/gvctoolsdemo-model/src/main/resources/mappers/writer/config/",
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
            ]
        }
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
        "url": "https://gskd.sdoprofile.com/schema/gyctools.config.schema.v1.json"
    }
    
```
