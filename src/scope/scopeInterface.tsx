import { FC, ReactNode } from "react"
import { MenuItemInterface } from "@/menu/menu"
import { ViewResourceContextParams } from "@/ViewResourceContext"
import { ViewResourceInterface } from "@/ViewResourceInterface"

export class UnauthorizedError extends Error {
  readonly status = 401
  constructor(message = "Not Logged") {
    super(message)
    this.name = "UnauthorizedError"
  }
}

export class ForbiddenError extends Error {
  readonly status = 403
  constructor(message = "Not Authorized") {
    super(message)
    this.name = "ForbiddenError"
  }
}

export interface ScopeInterface {
  resources?: ViewResourceInterface[]
  name: string
  decoratorComponent?: FC<{ children: ReactNode }>
  menu?: MenuItemInterface[]
  home?: string
  middleWare?: () => void
  label?: string
  defaultViewResourceContextParams?: ViewResourceContextParams
  /**
   * Fonction d'autorisation, synchrone ou asynchrone. Renvoyer `false` vaut un 403.
   * Toute erreur portant `status: 401` ou `status: 403` est reconnue ; les classes
   * ci-dessous n'en sont qu'une commodité.
   * @throws {UnauthorizedError} 401 - Not signed in
   * @throws {ForbiddenError} 403 - Not allowed
   */
  authorization?: () => boolean | Promise<boolean>
  /** Rendu à la place du scope tant que l'autorisation n'a pas répondu. */
  authorizationFallback?: ReactNode
  /** Rendu à la place du scope quand l'autorisation refuse l'accès (403). */
  forbiddenFallback?: ReactNode
}

export type ScopeConfig = Record<string, () => Promise<ScopeInterface>>
