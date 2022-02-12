import { StringUtils } from './StringUtils';
import { GycTools } from './GycTools';

export class CodeProperty {

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
    
    
    
    constructor(row: GycTools.TableColumnInfo, baseModelProperties: string[]) {
        this.columnName = row.columnName;
        this.dataType = row.dataType;
        this.isNullable = row.isNullable;
        this.comment = row.comment;
        this.isAutoIncrement = row.isAutoIncrement;
        this.propertyName = StringUtils.toLowerCamelCase(this.columnName);
        this.methodName = StringUtils.toUpperCamelCase(this.columnName);
        if (baseModelProperties.indexOf(this.propertyName) >= 0) {
            this.isInBaseModel = true;
        }
        this.isPrimaryKey=row.isPk;
    }


}
