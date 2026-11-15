import type { TableHTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from "react";
export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) { return <div className="ui-table-wrap"><table className={`ui-table${className ? ` ${className}` : ""}`} {...props} /></div>; }
export function TableHead({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) { return <th className={`ui-table__head${className ? ` ${className}` : ""}`} scope="col" {...props} />; }
export function TableCell({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) { return <td className={`ui-table__cell${className ? ` ${className}` : ""}`} {...props} />; }
