import { StringUtils } from './StringUtils';

export class CodeProperty {

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
    
    constructor(row: any, baseModelProperties: string[]) {
        this.columnName = row.COLUMN_NAME;
        this.dataType = row.DATA_TYPE;
        this.isNullable = row.IS_NULLABLE;
        this.comment = row.COLUMN_COMMENT;
        this.isAutoIncrement = row.EXTRA === 'auto_increment';
        this.propertyName = StringUtils.toLowerCamelCase(this.columnName);
        this.methodName = StringUtils.toUpperCamelCase(this.columnName);
        if (baseModelProperties.indexOf(this.propertyName) >= 0) {
            this.isInBaseModel = true;
        }
        if (row.COLUMN_KEY === 'PRI') {
            this.isPrimaryKey = true;
        }
    }


}
