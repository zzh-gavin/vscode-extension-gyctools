# EasyProducer-GYC

This is a tool for Generate Your Code(all programming languages or maybatis map-files and so on, up to you) from database table definition. Befor using it, you need know how work it is. So please read this document and config this tool for your own projects by ".vscode/gyctools.config.json".

And if you like this tool,please give us a star.thanks.

## Extension Dependencies

### [SQLTools](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools)

If want use this tools,you must install [SQLTools](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools). It's a very popular extension for database manage.

## Database Type supported

### MySQL

Install [SQLTools](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools) and [SQLTools MySQL/MariaDB driver](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools-driver-mysql) is necessarily.And the connection setting mast use 'Server and Port' and the password need select 'Save password' if not this tool can't connect to db server.

* Here is  SQLtoos connection config sample

``` json
"sqltools.connections": [
        {
            "previewLimit": 50,
            "server":"127.0.0.1",
            "port": 3306,
            "driver": "MySQL",
            "name": "GYSTools",
            "group": "GYSTools",
            "database": "gyc_tools",
            "username": "gyctools",
            "password": "gyctools"
        },
        {
            "mssqlOptions": {
                "appName": "SQLTools",
                "useUTC": true,
                "encrypt": false
            },
            "previewLimit": 500,
            "server": "127.0.0.1",
            "port": 1433,
            "driver": "MSSQL",
            "name": "GYSTools",
            "database": "GYSTools",
            "username": "gyctools",
            "password": "gyctools"
        }
]
```

So EasyProducer-GYC need the username and password to connect the target databse.It's important use dev db not product to protect your information.

### MsSQL

Install [SQLTools](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools) and [SQLTools MicrosoftSQL Server/Azure driver](https://marketplace.visualstudio.com/items?itemName=mtxr.sqltools-driver-mssql) is necessarily. And the connection setting mast use 'Server and Port' and the password need select 'Save password' if not this tool can't connect to db server.

## Usage

* Entry

![Usage](https://gskd.sdoprofile.com/schema/menuplace.jpg)

## Features

* generate all language from db table by [Nunjucks](https://github.com/mozilla/nunjucks) template

* two kind instance take part in the Nunjucks template.
  * CodeEntity is db table info, the properties can used in your template like this:
  
  ```njk
  {{dbType}}
  {{tableName}}
  {{className}}
  {{primaryKey}}
  ...
  ```

  * Here is features for CodeEntity
  
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
  
  ```njk
    {% for property in properties %}
        {% if property.isInBaseModel==false and property.columnName != primaryKey %}
    private {{ property.propertyType }} {{ property.propertyName }};
        {% endif %}
    {% endfor %}
  ```
  
  * Here is features for CodeProperty

  ``` typescript
    //table's column name
    columnName: string;
    //data type
    dataType: string;
    //data allowed null
    isNullable: boolean;
    //column is index and auto sequences
    isAutoIncrement: boolean;
    //column's comment info
    comment: string;
    //column is pk
    isPrimaryKey: boolean = false;
    //code(entity\pojo\object) field name translate from dataType 
    propertyName: string;
    //code field type
    propertyType?: string;
    //code field methodName for java's get set function
    methodName: string;
    //code field need import/requir thirdparty class/object
    importTypeName?: string;
    //field is defined in base object
    isInBaseModel: boolean = false;
  ```

## Extension Config File Manual

When tools activated,it will read tool config from "./vscode/gyctools.config.json". This section will told you how to make it or you can see the [config schema](https://gskd.sdoprofile.com/schema/gyctools.config.schema.json)

## Code Template Info

Tools has a bundle of templates in extension installation directory "template-sqg-spring",it's a java-spring and a private template demo you to edit them for youself style. Alternatively,you can contact us help you for your own templates. And then you can set the template folder in gyctools.config by "dataBaseList.item.templatePath".

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
    "overrideExists":true,
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

## Contact

* leechzhao3@hotmail.com  Looking Forward to Your Advice.
