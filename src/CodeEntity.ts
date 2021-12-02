import { CodeProperty } from "./CodeProperty";
import { GycTools } from "./GycTools";
import { StringUtils } from './StringUtils';
import { TypeInterpreter, TypeInterpreterFactory } from './TypeInterpreter';

export class CodeEntity {

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

    template: any;
   

    private typeInterpreter: TypeInterpreter;

    constructor(tableName: string, queryResult: any, baseModelProperties: string[], dataBaseConfig: GycTools.DatabaseConfig) {
        this.typeInterpreter = TypeInterpreterFactory.getInstance(dataBaseConfig);
        this.dbType = dataBaseConfig.databaseType;
        this.tableName = tableName;
        this.properties = new Array<CodeProperty>();
        this.tableNamePrefix = dataBaseConfig.tableNamePrefix;
        if (!this.tableNamePrefix) {
            this.className = StringUtils.toUpperCamelCase(this.tableName);
        } else {
            if ( this.tableNamePrefix.length>0 &&  tableName.startsWith(this.tableNamePrefix) ) {
                this.className = StringUtils.toUpperCamelCase(tableName.substring(this.tableNamePrefix.length));
            } else {
                this.className = StringUtils.toUpperCamelCase(this.tableName);
            }
        }
        this.customsAttributes = dataBaseConfig.customsAttributes;

        for (var i = 0; i < queryResult.length; i++) {
            let columnInfo = new CodeProperty(queryResult[i], baseModelProperties);
            columnInfo.propertyType = this.typeInterpreter.getPropertyType(columnInfo.dataType);
            this.properties.push(columnInfo);

            this.typeInterpreter.getTypeImport(this.importArray, columnInfo.dataType);
            if (columnInfo.isPrimaryKey) {
                this.primaryKey = columnInfo.columnName;
            }
            if (columnInfo.isAutoIncrement) {
                this.autoIncrementKey = columnInfo.columnName;
            }
        }

    };
}
