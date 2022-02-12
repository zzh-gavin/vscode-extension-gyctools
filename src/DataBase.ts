
import * as vscode from 'vscode';
import * as mssql from 'mssql';
// import * as mysql from 'mysql';
import { GycTools } from './GycTools';
import { Pool, PoolConnection } from 'mysql';


export function columnQuerierFactory(selectItem: any): GycTools.ColumnQuerier {
    switch (selectItem.conn.driver.toLowerCase()) {
        case 'mysql':
            return new MySqlColumnQuerier(selectItem);
        case 'mssql':
            return new MsSqlColumnQuerier(selectItem);
        default:
            return new MySqlColumnQuerier(selectItem);
    }

}

export class MsSqlColumnQuerier implements GycTools.ColumnQuerier {
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
        this.connectionConfig = this.getConnection(selectedItem.conn);
    }

    private getConnection(conn: GycTools.ConnectionConfig): mssql.config {
        if (GycTools.Utils.checkConnectionConfig(conn)) {
            return {
                database: conn.database,
                server: conn.server,
                user: conn.username,
                password: conn.password,
                domain: conn.domain || undefined,
                port: conn.port,
                options: conn.mssqlOptions
            };
        } else {
            console.error('Connection Config Info Error');
        }
        return undefined;
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
        if(this.connectionPool.connected){
            return this.getColumnInfo(this.connectionPool, sqlCommand);
        }else{
            vscode.window.showErrorMessage('database connect state error');
            return undefined;
        }
        
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



export class MySqlColumnQuerier implements GycTools.ColumnQuerier {

    databaseType: string = 'MySQL';
    databaseName: string;
    tableName: string;
    connection: Pool;

    constructor(selectedItem: any) {
        this.tableName = selectedItem.value;
        this.databaseName = selectedItem.conn.database;
        this.connection = this.getConnection(selectedItem.conn);
    }

    private getConnection(conn: GycTools.ConnectionConfig): Pool {
        var mysql = require('mysql');
        if (GycTools.Utils.checkConnectionConfig(conn)) {
            return mysql.createPool({
                host: conn.server,
                port: conn.port,
                user: conn.username,
                password: conn.password,
                database: conn.database,
                connectTimeout: 2000
            });
        } else {
            console.error('Connection Config Info Error');
        }
        return undefined;
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

        return new Promise<Array<GycTools.TableColumnInfo>>( ( resolve, reject ) => {
            this.connection.getConnection((error,connection)=>{
                if(error){
                    reject(error);
                }else{
                    resolve( this.getColumnInfo(connection,sqlCommand) );
                }
            });
        });
    }

    private getColumnInfo(connect: PoolConnection, sqlCommand: string): Promise<any> {
        return new Promise(function (resolve, reject) {
            connect.query(sqlCommand, (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
                connect.release();
            });
        });
    }


    public close() {
        this.connection.end();
    }

}


