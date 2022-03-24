import { prisma, Prisma, PrismaClient } from "@prisma/client";
import { ApolloServer, gql } from "apollo-server";
import { applyMiddleware } from "graphql-middleware";
import { verify } from "jsonwebtoken";
import { makeSchema } from "nexus";
import { $settings } from "nexus-prisma";
import { join } from "path";
import { permissions } from "./shield";
import * as types from "./types";

const schema = makeSchema({
  types,
  contextType: {
    module: join(__dirname, "types", "context.ts"),
    export: "ContextType",
  },
  outputs: {
    typegen: join(__dirname, "..", "nexus-typegen.ts"), // 2
    schema: join(__dirname, "..", "schema.graphql"), // 3
  },
});

const schemaWithMiddleware = applyMiddleware(schema, permissions);

const db = new PrismaClient();

const server = new ApolloServer({
  schema: schemaWithMiddleware,
  async context(httpContext) {
    if (httpContext.connection) {
      // check connection for metadata
      return { db };
    }
    try {
      const header = httpContext.req.header("Authorization")?.split(" ");
      const [bearer, token] = header || [];
      const user: { userId: string } = (await verify(
        token || "",
        process.env.SECRET!
      )) as any;
      const context = {
        db,
        // <-- You put Prisma client on the "db" context property
        user: await db.user.findUnique({
          where: { id: user.userId },
        }),
      };
      return context;
    } catch {
      return {
        db,
      };
    }
  },
});

$settings({
  prismaClientContextField: "db", // <-- Tell Nexus Prisma
});

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
