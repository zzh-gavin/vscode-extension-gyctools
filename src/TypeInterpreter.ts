import { GycTools } from "./GycTools";

export interface TypeInterpreter {

    typeInterpreterConfig: any;

    getPropertyType(dateType: string): string;

    getTypeImport(importArray: Array<string>, dataType: string): void

}


export class CustomsTypeInterpreter implements TypeInterpreter {

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
}


export class MsSqlToJavaTypeInterpreter extends CustomsTypeInterpreter {
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

export class TypeInterpreterFactory {
    static getInstance(dataBaseConfig: GycTools.DatabaseConfig): TypeInterpreter {
        if (dataBaseConfig.customsTypeInterpreterConfig) {
            return new CustomsTypeInterpreter(dataBaseConfig.customsTypeInterpreterConfig);
        } else {
            switch (dataBaseConfig.databaseType.toLowerCase()) {
                case 'mysql':
                    return new MySqlToJavaTypeInterpreter();
                case 'mssql':
                    return new MsSqlToJavaTypeInterpreter();
                default:
                    return new MySqlToJavaTypeInterpreter();
            }
        }
    }
}