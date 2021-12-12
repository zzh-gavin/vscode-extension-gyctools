import { StringUtils } from './StringUtils';
import { GycTools } from './GycTools';

export class CodeProperty {

    columnName: string;
    dataType: string;
    isNullable: boolean;
    comment: string;
    propertyName: string;
    propertyType?: string;
    methodName: string;
    isAutoIncrement: boolean;
    importTypeName?: string;
    isInBaseModel: boolean = false;
    isPrimaryKey: boolean = false;
    
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
