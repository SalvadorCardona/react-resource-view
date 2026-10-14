/** The playground's own components, declared: the resources only pass them on. */
import type { FC } from "react"
import type { RowComponentPropsInterface } from "react-resource-view"

type Row = FC<RowComponentPropsInterface>

export declare const CommentRow: Row
export declare const CompanyRow: Row
export declare const NewsletterRow: Row
export declare const PostRow: Row
export declare const ProductRow: Row
export declare const TaskRow: Row
export declare const UserRow: Row

export declare const CompanySummary: FC
export declare function companyNothingYet(what: string): FC
export declare const NewsletterBuilder: FC
export declare const NewsletterBuilderLink: FC
export declare const Overview: FC
export declare const PostBuilder: FC
export declare const UserActivity: FC
export declare const UserHeader: FC
export declare const UserPage: FC
export declare const UserResume: FC
export declare const UserSummary: FC
