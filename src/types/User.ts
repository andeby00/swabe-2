import { extendType, list, nonNull, objectType, stringArg } from "nexus";

// export const user = objectType({
//     name: User.$name,
//     description: User.$description,
//     definition(t) {
//       t.field(User.id);
//       t.field(User.username);
//       t.field(User.inventory);
//       t.field(User.money);
//       t.field(User.cart);
//       t.string('token');
//     },
//   });

export const UserQueries = extendType({
  type: "Query",
  definition: (t) => {
    t.field("users", {
      type: nonNull("String"),
      resolve: (source, args, ctx) => {
        return "lol";
      },
    });
  },
});
