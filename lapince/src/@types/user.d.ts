import type {IAccount} from "./account";
import type {IBudget} from "./budget"


export default interface IUser {
id:number;
pseudo:string;
email?:string;
role?:string;
created_at?:string;
account:IAccount[];
budget:IBudget[];
}

