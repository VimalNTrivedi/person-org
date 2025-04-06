import { LightningElement, api, wire } from "lwc";
import { gql, graphql, refreshApex } from "lightning/uiGraphQLApi";

// GraphQL query to fetch account data with contacts
const ACCOUNT_WITH_CONTACTS_QUERY = gql`
  query GetAccountWithContacts($accountId: ID!) {
    uiapi {
      query {
        Account(where: { Id: { eq: $accountId } }) {
          edges {
            node {
              Id
              Name {
                value
              }
              Phone {
                value
              }
              Website {
                value
              }
              Industry {
                value
              }
              AnnualRevenue {
                value
              }
              NumberOfEmployees {
                value
              }
              BillingStreet {
                value
              }
              BillingCity {
                value
              }
              BillingState {
                value
              }
              BillingPostalCode {
                value
              }
              BillingCountry {
                value
              }
              Contacts {
                edges {
                  node {
                    Id
                    Name {
                      value
                    }
                    Title {
                      value
                    }
                    Email {
                      value
                    }
                    Phone {
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export default class AccountContactsCard extends LightningElement {
  @api recordId;

  isLoading = true;
  error;
  accountData;

  // GraphQL wire to fetch account data
  @wire(graphql, {
    query: ACCOUNT_WITH_CONTACTS_QUERY,
    variables: "$variables"
  })
  graphqlQueryResult({ data, errors }) {
    this.isLoading = true;

    if (data) {
      try {
        // Process the GraphQL response
        const accountEdges = data.uiapi.query.Account.edges;

        if (accountEdges && accountEdges.length > 0) {
          const accountNode = accountEdges[0].node;

          // Process account data
          this.accountData = this.processAccountData(accountNode);
          this.error = undefined;
        } else {
          this.error = "No account found with the provided ID.";
          this.accountData = undefined;
        }
      } catch (error) {
        this.error = "Error processing account data: " + error.message;
        this.accountData = undefined;
      }
    } else if (errors) {
      this.error =
        "GraphQL query error: " +
        errors.map((error) => error.message).join(", ");
      this.accountData = undefined;
    }

    this.isLoading = false;
  }

  // Process the account data from GraphQL response
  processAccountData(accountNode) {
    const processedAccount = {
      Id: accountNode.Id,
      Name: accountNode.Name.value,
      Phone: accountNode.Phone.value,
      Website: accountNode.Website.value,
      Industry: accountNode.Industry.value,
      AnnualRevenue: accountNode.AnnualRevenue.value,
      NumberOfEmployees: accountNode.NumberOfEmployees.value,
      BillingStreet: accountNode.BillingStreet.value,
      BillingCity: accountNode.BillingCity.value,
      BillingState: accountNode.BillingState.value,
      BillingPostalCode: accountNode.BillingPostalCode.value,
      BillingCountry: accountNode.BillingCountry.value,
      Contacts: {
        edges: accountNode.Contacts.edges.map((contactEdge) => ({
          node: {
            Id: contactEdge.node.Id,
            Name: contactEdge.node.Name.value,
            Title: contactEdge.node.Title.value,
            Email: contactEdge.node.Email.value,
            Phone: contactEdge.node.Phone.value
          }
        }))
      }
    };

    return processedAccount;
  }

  // Handle refresh button click
  handleRefresh() {
    this.isLoading = true;
    return refreshApex(this.graphqlQueryResult);
  }

  // Computed properties
  get variables() {
    return {
      accountId: this.recordId
    };
  }

  get account() {
    return this.accountData;
  }

  get hasContacts() {
    return (
      this.accountData &&
      this.accountData.Contacts &&
      this.accountData.Contacts.edges &&
      this.accountData.Contacts.edges.length > 0
    );
  }

  get contactsCount() {
    return this.hasContacts ? this.accountData.Contacts.edges.length : 0;
  }
}
