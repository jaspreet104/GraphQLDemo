const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const app = express()
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql')

const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
        name: 'HelloWorld',
        fields: () => ({
            message: {
                type: GraphQLString,
                resolve: () => 'Hello GraphQL'
            }
        })
    })
})

const authors = [
    {id: 1, name: 'author 1'},
    {id: 2, name: 'author 2'},
    {id: 3, name: 'author 3'},
    {id: 4, name: 'author 4'}
]

const books =[
    {id: 1, name: 'name 1', authorId: 1},
    {id: 2, name: 'name 2', authorId: 1},
    {id: 3, name: 'name 3', authorId: 2},
    {id: 4, name: 'name 4', authorId: 4},
    {id: 5, name: 'name 5', authorId: 4},
    {id: 6, name: 'name 6', authorId: 4}
]

const AuthorType = new GraphQLObjectType({
    name: 'author',
    description: 'author of a book',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        books: {
            type: GraphQLList(BookType),
            resolve: (author) => {
                return books.filter(book => book.authorId === author.id)
        }}
    })
})

const BookType = new GraphQLObjectType({
    name: 'book',
    description: 'this is a book written by an author',
    fields: () => ({
        id: { type: GraphQLNonNull(GraphQLInt) },
        name: { type: GraphQLNonNull(GraphQLString) },
        authorId: { type: GraphQLNonNull(GraphQLInt) },
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find(author => author.id === book.authorId)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'root query',
    fields: () => ({
        book: {
            type: BookType,
            description: 'a single book',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => books.find(book => book.id === args.id)
        },
        books: {
            type: new GraphQLList(BookType),
            description: 'list of all books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            description: 'list of all authors',
            resolve: () => authors
        },
        author: {
            type: AuthorType,
            description: 'one author',
            args: {
                id: { type: GraphQLInt }
            },
            resolve: (parent, args) => authors.find(author => author.id === args.id)
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'root mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'add a book',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) },
                authorId: { type: GraphQLNonNull(GraphQLInt) }
            },
            resolve: (parent, args) => {
                const book = { id: books.length + 1, name: args.name, authorId: args.authorId }
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'add author',
            args: {
                name: { type: GraphQLNonNull(GraphQLString) }
            },
            resolve: (parent, args) => {
                const author = { id: authors.length + 1, name: args.name}
                authors.push(author)
                return author
            }
        }
    })
})

const bookSchema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))
app.use('/bookgraphql', expressGraphQL({
    schema: bookSchema,
    graphiql: true
}))
app.listen(5000, () => console.log('Server running'))
