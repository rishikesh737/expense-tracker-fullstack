/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateExpense = /* GraphQL */ `
  subscription OnCreateExpense(
    $filter: ModelSubscriptionExpenseFilterInput
    $owner: String
  ) {
    onCreateExpense(filter: $filter, owner: $owner) {
      id
      description
      amount
      category
      date
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onUpdateExpense = /* GraphQL */ `
  subscription OnUpdateExpense(
    $filter: ModelSubscriptionExpenseFilterInput
    $owner: String
  ) {
    onUpdateExpense(filter: $filter, owner: $owner) {
      id
      description
      amount
      category
      date
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const onDeleteExpense = /* GraphQL */ `
  subscription OnDeleteExpense(
    $filter: ModelSubscriptionExpenseFilterInput
    $owner: String
  ) {
    onDeleteExpense(filter: $filter, owner: $owner) {
      id
      description
      amount
      category
      date
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
