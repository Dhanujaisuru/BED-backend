/// <reference types="@clerk/express/env" />

export {};

export type Role = "admin";

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Role;
    };
  } 
}
