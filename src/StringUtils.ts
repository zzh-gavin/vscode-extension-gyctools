
export class StringUtils {

    public static toLowerCamelCase(str: string): string {
        let result = '';
        str.split('_').forEach((element) => {
            result += this.toUpperCaseFristOne(element);
        });
        return this.toLowerCaseFristOne(result);
    }

    public static toUpperCamelCase(str: string): string {
        let result = '';
        str.split('_').forEach((element) => {
            result += this.toUpperCaseFristOne(element);
        });
        return result;
    }

    public static toUpperCaseFristOne(str: string): string {
        let result = '' ;
        return result.concat(str.substring(0, 1).toUpperCase(), str.substring(1));
    }

    public static toLowerCaseFristOne(str: string): string {
        let result = '' ;
        return result.concat(str.substring(0, 1).toLowerCase(), str.substring(1));
    }
    


}
