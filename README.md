## Description

PowerUs Coding Challenge Submission.

Flight service to scrape flight data from a list of sources and return a set to the client.

## Requirements

- NodeJS installed globally
- NPM installed globally

## Installation

```bash
$ npm install
```

## Starting the service

```bash
$ npm run start
```

## Running the tests

Use the below commands to run the tests and end to end tests. These tests also run on each pull request, and they must pass for the pull request to be merged. In production, linters should also run on these pull requests, and a rule should be set to have one or two passing reviews before the pr can be merged.

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e
```

## Using the service

The service will be listening on localhost:3000 when started.

There are two currently available endpoints you can call:

### GET /

Which returns a list of all currently known flights.

### GET /search?

Which returns a filtered list of all currently known flights. The are two currently implemented query parameters which can be used as search filters. These are 'origin' and 'destination'.

Examples:

- `localhost:3000/search?origin=stansted` will return a list of all flights which originate from Stansted airport.

- `localhost:3000/search?destination=stansted` will return a list of all flights which land at Stansted airport.

- `localhost:3000/search?origin=stansted&destination=schonefeld` will return a list of all flights which originate at Stansted and land at Schonefeld.

## Development Notes

### First Iteration

The first idea I had when creating this app was to store the fetched flights with an in-memory cache. This felt like a simple approach to get it up and running quickly, and required almost no third-party code (aside from the Nest framework itself).

The idea here was to fetch flights every few minutes, wait for all reponses from the sources to either finish or fail, and store the full response in a hash-map with no duplicates, where the key is the current timestamp, and the value is the array of flights.

When the user requests flights from my service, each 'timeboxed-window' in the cache would be checked to see if it was still valid. If so, then those flights would be added to a hash-map ready to be returned. Each window in the cache would be checked this way in chronological order, so the latest flight details value would be used, and they would all be valid. This hash map would then be turned into an array and sent back to the client.

Every so often, the cache would be cleaned of any out-of-date cache windows.

Whilst this solution worked, it wasn't ideal. Too much work had to be done at request-time, and there was potential for too many cache windows to being created unnecessarily, often with duplicate data. It was also not very scalable, as adding any other endpoints such as searching, pagination, or ordering by some property would all be difficult to implement.

### Second Iteration

For the second iteration, I decided to use a database. This would allow for more scalability, allowing easier filtering and pagination in the future. It also ensures that there's not too much unnecessary data being added, as flights could be upserted into the db and just overwritten, with an `updated_at` key added so that you know which flights are still valid on each call.

The database I decided to use was sqlite, as it was very lightweight and allowed for easy setup. In the future, it can very easily be replaced with something like mySQL or PostgreSQL.

As NestJS themselves suggest, I also used Typeorm to make interacting with the database very simple for the developer.

To show how the service could be extended in the future, I created a search endpoint, where the client can use query parameters to filter for flights with specific origins and destinations.

In terms of fetching the data from the sources, I've implemented a node-cron job which is called every minute. It loops through each source, and triggers an asynchronous function to fetch data from that source, and then place the results into the db using an upsert. This job could be extended and improved on in the future, to instead implement some sort of priority queue to fetch results based on which endpoint hasn't been called recently. It could also use workers to parallelize the calls.

My http service has a timeout of 10 seconds on each call to allow for slow responses from the sources. There is also a retry mechanism on each call, which allows for 5 retries. This retry / error handling is another part of the service which could be improved in the future, to cover all sorts of errors. For example, if the error is of type bad request or too many requests, then the retries perhaps shouldn't happen.

If I was to work on this service in a production environment, I would also consider adding a few more things (besides more endpoints / filtering / pagination etc), depending on the needs of the product team. The first of these would be rate limiting to protect the service from brute force attacks, and ensure that it doesn't crash under a heavy load. This can be done easily in NestJS by following the instructions here: https://docs.nestjs.com/security/rate-limiting.
