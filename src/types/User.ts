import { extendType, list, nonNull, objectType, stringArg } from "nexus";
import { User } from "nexus-prisma";
import { hash } from "bcrypt";
import { sign } from "jsonwebtoken";

export const user = objectType({
  name: User.$name,
  description: User.$description,
  definition(t) {
    t.field(User.id);
    t.field(User.name);
    t.field(User.mail);
    t.field(User.role);
    t.string("token");
  },
});

export const login = objectType({
  name: "Login",
  definition(t) {
    t.id("id");
    t.field("name", { type: "String" });
    t.string("token");
  },
});

export const UserQueries = extendType({
  type: "Query",
  definition: (t) => {
    t.field("users", {
      type: nonNull(list(nonNull("User"))),
      resolve: async (source, args, ctx) => {
        return ctx.db.user.findMany();
      },
    });
  },
});

export const UserMutations = extendType({
  type: "Mutation",
  definition(t) {
    t.field("userCreate", {
      type: nonNull("Login"),
      args: {
        name: nonNull(stringArg()),
        mail: nonNull(stringArg()),
        password: nonNull(stringArg()),
        role: nonNull(stringArg()),
      },
      resolve: async (source, args, ctx) => {
        // const anyUser = await ctx.db.user.findFirst({ where: { username } });

        // if (anyUser) {
        //   throw new ApolloError('Username already in use');
        // }

        const user = await ctx.db.user.create({
          data: {
            name: args.name,
            mail: args.mail,
            password: await hash(args.password, 12),
            role: args.role,
          },
        });

        return {
          token: await sign({ userId: user.id }, process.env.SECRET!, {
            expiresIn: "60m",
          }),
          name: user.name,
          id: user.id,
        };
      },
    });
  },
});
