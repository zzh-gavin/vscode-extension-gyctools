import { GycTools } from './GycTools';

export interface TypeInterpreter {

    typeLanguage: string;

    typeInterpreterConfig: any;

    getPropertyType(dateType: string): string;

    getTypeImport(importArray: Array<string>, dataType: string): void

}


export class CustomsTypeInterpreter implements TypeInterpreter {

    typeLanguage: string;
    typeInterpreterConfig: any;

    constructor(interpreterConfig: any) {
        this.typeInterpreterConfig = interpreterConfig;
    }

    getPropertyType(dataType: string): string {
        if (this.typeInterpreterConfig[dataType]) {
            return this.typeInterpreterConfig[dataType].result;
        } else {
            return this.typeInterpreterConfig['default'].result;
        }
    }

    getTypeImport(importArray: Array<string>, dataType: string): void {
        if (this.typeInterpreterConfig[dataType]
            && this.typeInterpreterConfig[dataType].importTypeName
            && importArray.indexOf(this.typeInterpreterConfig[dataType].importTypeName) === -1
        ) {
            importArray.push(this.typeInterpreterConfig[dataType].importTypeName);
        }
    }

    joinTypeInterpreter(customsTypeInterpreter: CustomsTypeInterpreter): void {
        for (let key of Object.keys(customsTypeInterpreter.typeInterpreterConfig)) {
            let config = customsTypeInterpreter.typeInterpreterConfig[key];
            this.typeInterpreterConfig[key] = config;
        }
    }
}

export interface TypeInterpreterConfig {
    result: string;
    importTypeName: string;
}

export class MsSqlToTsTypeInterpreter extends CustomsTypeInterpreter {
    typeLanguage: string = "ts";
    static dbTypeToTsTypeInterpreterConfig: any = {
        'int': { 'result': 'number' },
        'tinyint': { 'result': 'number' },
        'smallint': { 'result': 'number' },
        'datetime': { 'result': 'Date' },
        'smalldatetime': { 'result': 'Date' },
        'timestamp': { 'result': 'Date' },
        'date': { 'result': 'Date' },
        'time': { 'result': 'Date' },
        'decimal': { 'result': 'number' },
        'numeric': { 'result': 'number' },
        'money': { 'result': 'number' },
        'bit': { 'result': 'boolean' },
        'bigint': { 'result': 'number' },
        'default': { 'result': 'string' }
    };
    constructor() {
        super(MsSqlToTsTypeInterpreter.dbTypeToTsTypeInterpreterConfig);
    }
}


export class MySqlToTsTypeInterpreter extends CustomsTypeInterpreter {
    typeLanguage: string = "ts";
    static dbTypeToTsTypeInterpreterConfig: any = {
        'int': { 'result': 'number' },
        'tinyint': { 'result': 'number' },
        'smallint': { 'result': 'number' },
        'datetime': { 'result': 'Date' },
        'timestamp': { 'result': 'Date' },
        'date': { 'result': 'Date' },
        'time': { 'result': 'Date' },
        'decimal': { 'result': 'number' },
        'bit': { 'result': 'boolean' },
        'bigint': { 'result': 'number' },
        'default': { 'result': 'string' }
    };
    constructor() {
        super(MySqlToTsTypeInterpreter.dbTypeToTsTypeInterpreterConfig);
    }
}

export class MsSqlToJavaTypeInterpreter extends CustomsTypeInterpreter {
    typeLanguage: string = "java";
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
    constructor() {
        super(MsSqlToJavaTypeInterpreter.dbTypeToJavaTypeInterpreterConfig);
    }
}

export class MySqlToJavaTypeInterpreter extends CustomsTypeInterpreter {
    typeLanguage: string = "java";
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
    constructor() {
        super(MySqlToJavaTypeInterpreter.dbTypeToJavaTypeInterpreterConfig);
    }
}


export class MsSqlToCsTypeInterpreter extends CustomsTypeInterpreter {
    typeLanguage: string = "cs";
    static dbTypeToCsTypeInterpreterConfig: any = {
        'int': { 'result': 'Int32', 'importTypeName': 'System' },
        'tinyint': { 'result': 'Int16', 'importTypeName': 'System' },
        'smallint': { 'result': 'Int16', 'importTypeName': 'System' },
        'datetime': { 'result': 'DateTime', 'importTypeName': 'System' },
        'smalldatetime': { 'result': 'Date', 'importTypeName': 'System' },
        'timestamp': { 'result': 'Date', 'importTypeName': 'System' },
        'date': { 'result': 'Date', 'importTypeName': 'System' },
        'time': { 'result': 'Date', 'importTypeName': 'System' },
        'decimal': { 'result': 'Decimal', 'importTypeName': 'System' },
        'numeric': { 'result': 'Decimal', 'importTypeName': 'System' },
        'money': { 'result': 'Decimal', 'importTypeName': 'System' },
        'bit': { 'result': 'Boolean', 'importTypeName': 'System' },
        'bigint': { 'result': 'Int64', 'importTypeName': 'System' },
        'default': { 'result': 'String', 'importTypeName': 'System' }
    };
    constructor() {
        super(MsSqlToCsTypeInterpreter.dbTypeToCsTypeInterpreterConfig);
    }
}

export class MySqlToCsTypeInterpreter extends CustomsTypeInterpreter {
    typeLanguage: string = "cs";
    static dbTypeToCsTypeInterpreterConfig: any = {
        'int': { 'result': 'Int32', 'importTypeName': 'System' },
        'tinyint': { 'result': 'Int16', 'importTypeName': 'System' },
        'smallint': { 'result': 'Int16', 'importTypeName': 'System' },
        'datetime': { 'result': 'DateTime', 'importTypeName': 'System' },
        'timestamp': { 'result': 'DateTime', 'importTypeName': 'System' },
        'date': { 'result': 'DateTime', 'importTypeName': 'System' },
        'time': { 'result': 'DateTime', 'importTypeName': 'System' },
        'decimal': { 'result': 'Decimal', 'importTypeName': 'System' },
        'bit': { 'result': 'Boolean', 'importTypeName': 'System' },
        'bigint': { 'result': 'Int64', 'importTypeName': 'System' },
        'default': { 'result': 'String', 'importTypeName': 'System' }
    };
    constructor() {
        super(MySqlToCsTypeInterpreter.dbTypeToCsTypeInterpreterConfig);
    }
}


export class TypeInterpreterFactory {

    static getInstance(dataBaseConfig: GycTools.DatabaseConfig, templateInfo: GycTools.TemplateInfo): TypeInterpreter {
        let interpreter: CustomsTypeInterpreter;
        const fileType = templateInfo.outFileType.substring(templateInfo.outFileType.lastIndexOf('.') + 1, templateInfo.outFileType.length);
        let interpreterKey = (dataBaseConfig.databaseType.toLowerCase() + '_') + (templateInfo.language ? templateInfo.language : fileType);
        if (!GycSystemTypeInterpreter.allSystemTypeInperpreter.has(interpreterKey)) {
            interpreterKey = dataBaseConfig.databaseType.toLowerCase() + '_java';
        }
        interpreter = GycSystemTypeInterpreter.allSystemTypeInperpreter.get(interpreterKey);
        if (dataBaseConfig.customsTypeInterpreterConfig) {
            interpreter.joinTypeInterpreter(new CustomsTypeInterpreter(dataBaseConfig.customsTypeInterpreterConfig));
        }
        if (templateInfo.customsTypeInterpreterConfig) {
            interpreter.joinTypeInterpreter(new CustomsTypeInterpreter(templateInfo.customsTypeInterpreterConfig));
        }
        return interpreter;
    }
}

export class GycSystemTypeInterpreter {
    public static allSystemTypeInperpreter: Map<string, CustomsTypeInterpreter> = new Map<string, CustomsTypeInterpreter>([
        ['mysql_ts', new MySqlToTsTypeInterpreter()],
        ['mssql_ts', new MsSqlToTsTypeInterpreter()],

        ['mysql_java', new MySqlToJavaTypeInterpreter()],
        ['mssql_java', new MsSqlToJavaTypeInterpreter()],

        ['mysql_cs', new MySqlToCsTypeInterpreter()],
        ['mssql_cs', new MsSqlToCsTypeInterpreter()],
    ]);
}
