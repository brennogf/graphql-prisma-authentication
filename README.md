## :information_source: How To Use

To clone and run this application, you'll need [Git](https://git-scm.com), [Node.js v14.18][nodejs] or higher + [Yarn v1.22.14][yarn] or higher installed on your computer. From your command line:

```bash
# Clone this repository
$ git clone https://github.com/brennogf/graphql-prisma-authentication

# Go into the repository and install dependencies
$ cd graphql-prisma-authentication
$ yarn

# Create the databases in the Docker
$ NODE_ENV=test docker-compose up
$ NODE_ENV=development docker-compose up

# Onn another terminal create the database tables
$ NODE_ENV=development yarn prisma migrate dev



# Start docker-compose on another terminal before starting the app
$ docker-compose up

# Run the app
$ yarn dev
```

## :memo: License

This project is under the MIT license. See the [LICENSE](https://github.com/brennogf/graphql-prisma-authentication/blob/main/LICENSE) for more information.

---

Made with ♥ by Brenno Givigier :wave: [Get in touch!](https://www.linkedin.com/in/brenno-givigier/)
