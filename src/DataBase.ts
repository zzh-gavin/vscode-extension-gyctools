import { GycTools } from './GycTools';
import * as mysql from 'mysql';
import * as vscode from 'vscode';
import * as mssql from 'mssql';

export function columnQuerierFactory(selectItem: any): ColumnQuerier {
    switch (selectItem.conn.driver.toLowerCase()) {
        case 'mysql':
            return new MySqlColumnQuerier(selectItem);
        case 'mssql':
            return new MsSqlColumnQuerier(selectItem);
        default:
            return new MySqlColumnQuerier(selectItem);
    }
    
}

export class MsSqlColumnQuerier implements ColumnQuerier {
    databaseType: string = 'MsSQL';
    databaseName: string;
    tableName: string;
    connectionConfig: mssql.config;
    connectionString: string;

    connectionPool?: mssql.ConnectionPool;

    constructor(selectedItem: any) {
        this.tableName = selectedItem.value;
        this.databaseName = selectedItem.conn.database;
        this.connectionString = selectedItem.conn.connectString;
        this.connectionConfig = {
            database: selectedItem.conn.database,
            server: selectedItem.conn.server,
            user: selectedItem.conn.username,
            password: selectedItem.conn.password,
            domain: selectedItem.conn.domain || undefined,
            port: selectedItem.conn.port,
            options: selectedItem.conn.mssqlOptions
        };

    }


    public async getTableColumnInfo(): Promise<GycTools.TableColumnInfo[]> {
        const sqlCommand = `
        SELECT
        C.COLUMN_NAME as columnName,
        C.DATA_TYPE as dataType,
        CASE C.IS_NULLABLE WHEN 'NO' THEN 0 WHEN 'YES' THEN 1 ELSE 0 END AS 'isNullable',
        CE.value as comment,
        SC.is_identity as isAutoIncrement, 
        CASE C.IS_NULLABLE WHEN 'NO' THEN 0 WHEN 'YES' THEN 1 ELSE 0 END AS 'isNullable',
        C.TABLE_NAME as tableName,
        c.TABLE_CATALOG as databaseName,
        CASE isnull(TC.CONSTRAINT_TYPE,'') WHEN 'PRIMARY KEY' THEN 1 ELSE 0 END AS isPk
        FROM
        INFORMATION_SCHEMA.COLUMNS C
        LEFT JOIN INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KCU ON (
            C.TABLE_CATALOG = KCU.TABLE_CATALOG
            AND C.TABLE_NAME = KCU.TABLE_NAME
            AND C.TABLE_SCHEMA = KCU.TABLE_SCHEMA
            AND C.TABLE_CATALOG = KCU.TABLE_CATALOG
            AND C.COLUMN_NAME = KCU.COLUMN_NAME
        )
        LEFT JOIN INFORMATION_SCHEMA.TABLE_CONSTRAINTS AS TC ON (
            TC.CONSTRAINT_NAME = KCU.CONSTRAINT_NAME
            AND TC.TABLE_SCHEMA = KCU.TABLE_SCHEMA
            AND TC.TABLE_CATALOG = KCU.TABLE_CATALOG
        )
        JOIN INFORMATION_SCHEMA.TABLES AS T ON C.TABLE_NAME = T.TABLE_NAME
        AND C.TABLE_SCHEMA = T.TABLE_SCHEMA
        AND C.TABLE_CATALOG = T.TABLE_CATALOG
        LEFT JOIN SYS.COLUMNS AS SC ON OBJECT_ID(C.TABLE_NAME) = SC.object_id
        AND C.COLUMN_NAME=SC.name
        LEFT JOIN SYS.EXTENDED_PROPERTIES CE ON SC.object_id=CE.major_id and SC.column_id = CE.minor_id
        where c.TABLE_NAME='${this.tableName}' AND C.TABLE_CATALOG ='${this.databaseName}'
        `;
        this.connectionPool = await mssql.connect(this.connectionString || this.connectionConfig);
        return this.getColumnInfo(this.connectionPool, sqlCommand);
    }

    private getColumnInfo(connect: mssql.ConnectionPool, sqlCommand: string): Promise<any> {
        return new Promise(function (resolve, reject) {
            connect.query(sqlCommand, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result.recordset);
                }
            });
        });
    }


    close() {
        this.connectionPool.close();
    }

}



export class MySqlColumnQuerier implements ColumnQuerier {
    databaseType: string = 'MySQL';
    databaseName: string;
    tableName: string;
    connection: mysql.Connection;

    constructor(selectedItem: any) {
        this.tableName = selectedItem.value;
        this.databaseName = selectedItem.conn.database;
        this.connection = mysql.createConnection({
            host: selectedItem.conn.server,
            port: selectedItem.conn.port,
            user: selectedItem.conn.username,
            password: selectedItem.conn.password,
            database: selectedItem.conn.database,
            connectTimeout: 2000
        });
    }


    public getTableColumnInfo(): Promise<Array<GycTools.TableColumnInfo>> {
        const sqlCommand = `
        SELECT COLUMN_Name AS 'columnName',
        DATA_TYPE AS 'dataType',
        CASE IS_NULLABLE WHEN 'NO' THEN 0 WHEN 'YES' THEN 1 ELSE 0 END AS 'isNullable',
        COLUMN_COMMENT AS 'comment',
        CASE EXTRA WHEN 'auto_increment' THEN 1 ELSE 0 END AS 'isAutoIncrement',
        CASE COLUMN_KEY WHEN 'PRI' THEN 1 ELSE 0 END AS 'isPk',
        TABLE_NAME AS tableName,
        TABLE_SCHEMA AS databaseName
        FROM information_schema.COLUMNS where TABLE_NAME = '${this.tableName}' AND TABLE_SCHEMA ='${this.databaseName}'
        `;
        this.connection.connect((e) => {
            console.error(e);
            vscode.window.showErrorMessage(e.message);
        });
        const queryResult = GycTools.Utils.getColumnInfo(this.connection, sqlCommand);
        return queryResult;
    }

    public close() {
        this.connection.end();
    }

}



export interface ColumnQuerier {
    databaseType: string;
    databaseName: string;
    tableName: string;
    getTableColumnInfo(): Promise<Array<GycTools.TableColumnInfo>>
    close();
}
