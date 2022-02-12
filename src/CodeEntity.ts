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
    //table's first primary key 
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
    //table's all primary key
    primarykeyArray: Array<string> = new Array<string>();
    //table's all primary key translated to property
    primaryKeyPropertyArray: Array<string> = new Array<string>();

    template: any;


    private typeInterpreter: TypeInterpreter;

    constructor(columnQuerier: GycTools.ColumnQuerier, queryResult: any, baseModelProperties: string[], dataBaseConfig: GycTools.DatabaseConfig) {
        dataBaseConfig.databaseType = columnQuerier.databaseType;
        this.typeInterpreter = TypeInterpreterFactory.getInstance(dataBaseConfig);
        this.dbType = columnQuerier.databaseType;
        this.tableName = columnQuerier.tableName;
        this.properties = new Array<CodeProperty>();
        this.tableNamePrefix = dataBaseConfig.tableNamePrefix;
        if (!this.tableNamePrefix) {
            this.className = StringUtils.toUpperCamelCase(this.tableName);
        } else {
            if (this.tableNamePrefix.length > 0 && this.tableName.startsWith(this.tableNamePrefix)) {
                this.className = StringUtils.toUpperCamelCase(this.tableName.substring(this.tableNamePrefix.length));
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
                if (!this.primaryKey) {
                    this.primaryKey = columnInfo.columnName;
                }
                this.primarykeyArray.push(columnInfo.columnName);
                this.primaryKeyPropertyArray.push(columnInfo.propertyName);
            }
            if (columnInfo.isAutoIncrement) {
                this.autoIncrementKey = columnInfo.columnName;
            }
        }

    };
}
