import similarString from '../utils/strings';
import dateFunctions from '../utils/dates';
import amountFunctions from '../utils/amount';
import getTransaction from '../handlers/getTransactionsHandler';

let storingTransactionsMAP = new Map();

Set.prototype.intersection = function(otherSet)
{
    // creating new set to store intersection
    let intersectionSet = new Set();
    // Iterate over the values
    for(let elem of otherSet)
    {
        // if the other set contains a
        // similar value as of value[i]
        // then add it to intersectionSet
        if(this.has(elem))
            intersectionSet.add(elem);
    }
// return values of intersectionSet
    return intersectionSet;
};

Set.prototype.union = function(otherSet)
{
    // creating new set to store union
    let unionSet = new Set();

    // iterate over the values and add
    // it to unionSet
    for (let elem of this)
    {
        unionSet.add(elem);
    }

    // iterate over the values and add it to
    // the unionSet
    for(let elem of otherSet)
        unionSet.add(elem);

    // return the values of unionSet
    return unionSet;
};
/**
 * Function match key will match the current transaction name with existing transactions in the object
 * It will return an object with transaction name and all its records
 * It will return an empty object if the name does not match
 */
const matchKey = (transactionName, storingTransactionsMAP) => {
    // initialize this as empty
    let transactionObject = {};
    // If key is found
    if (storingTransactionsMAP.has(transactionName)) {
        let getTransaction = storingTransactionsMAP.get(transactionName);
        transactionObject = {
            'name': transactionName,
            'records': getTransaction
        };
        return transactionObject;
        // if the key is not exact match then look for a similar string. If string is similar then return object else return empty
    } else  {
        let keyIterator = storingTransactionsMAP.keys();
        keyIterator = [...keyIterator];
        keyIterator.forEach(key => {
            if (similarString(key, transactionName)){
                let getTransaction = storingTransactionsMAP.get(key);
                transactionObject = {
                    'name': key,
                    'records': getTransaction
                };
            }
        });
        return transactionObject;
    }
};

const upsertTransactions = async (transactionArray) => {
    console.log('------------------------------------------------------------------------------');
    console.log('HOW IS THE TRANSACTION OBJECT COMING IN -------');
    console.log(transactionArray);
    console.log('------------------------------------------------------------------------------');
    let recurringTransactionMap = new Map();
    // Loop through each element in the transactions that are coming in and ADD each transaction into MAP based of company name
    // let transactionsInput = transactionArray.transaction;
    transactionArray.forEach(currentTransaction => {
        let transactionsObjectInMap = matchKey(currentTransaction.name, storingTransactionsMAP);
        if (Object.keys(transactionsObjectInMap).length === 0) {
            storingTransactionsMAP.set(currentTransaction.name, [currentTransaction]);
        }
        else {
            transactionsObjectInMap.records.push(currentTransaction);
        }
    });

    // SORT
    let companyNameKeyArray = [...storingTransactionsMAP.keys()];
    let tempArray = [];
    companyNameKeyArray.forEach(key => {
        tempArray = [];
        let transactionForEachCompany = [...storingTransactionsMAP.get(key).entries()].sort((transaction1, transaction2)=>{
            let date1 = transaction1[1].date;
            let date2 = transaction2[1].date;
            return (date1 < date2) ? -1 : (date1 > date2) ? 1 : 0;
        });
        transactionForEachCompany.forEach(transaction=> {
            tempArray.push(transaction[1]);
        });
        storingTransactionsMAP.set(key, tempArray);
    });

    let arrayOfTransactionsForOneCompany = [];

    companyNameKeyArray.forEach(key=>{
        let arrayOfTuples=[];
        arrayOfTransactionsForOneCompany = [...storingTransactionsMAP.get(key)];

        for(let i =0 ; i< arrayOfTransactionsForOneCompany.length-2; i++) {

            for(let j=i+1; j<arrayOfTransactionsForOneCompany.length-1; j++) {

                for(let k=j+1; k<arrayOfTransactionsForOneCompany.length; k++) {
                    let tripleSet = new Set();

                   let num_of_days_between_1_2 = dateFunctions.daysBetweenDates(arrayOfTransactionsForOneCompany[i].date, arrayOfTransactionsForOneCompany[j].date);
                   let num_of_days_between_2_3 = dateFunctions.daysBetweenDates(arrayOfTransactionsForOneCompany[j].date, arrayOfTransactionsForOneCompany[k].date);
                   let amount_difference_between_1_2 = amountFunctions.amountDifference(arrayOfTransactionsForOneCompany[i].amount, arrayOfTransactionsForOneCompany[j].amount);
                   let amount_difference_between_2_3 = amountFunctions.amountDifference(arrayOfTransactionsForOneCompany[j].amount, arrayOfTransactionsForOneCompany[k].amount);
                   //let averageAmount = amountFunctions.averageAmount(amount_difference_between_1_2,amount_difference_between_2_3);
                   let recurrencePeriodDifference = dateFunctions.recurrencePeriodDifference(num_of_days_between_1_2, num_of_days_between_2_3);
                 //  let averageRecurrencePeriod = dateFunctions.avgRecurrencePeriod(num_of_days_between_1_2,num_of_days_between_2_3);
                 //   let name = key;
                 //   let user_id = arrayOfTransactionsForOneCompany[i].user_id;
                 //    let displayObj = {
                 //        'name': name,
                 //        'user_id': user_id,
                 //        'next_amt': averageAmount
                 //    };
                   if (amount_difference_between_1_2 && amount_difference_between_2_3 && recurrencePeriodDifference) {
                       tripleSet.add(arrayOfTransactionsForOneCompany[i]);
                       tripleSet.add(arrayOfTransactionsForOneCompany[j]);
                       tripleSet.add(arrayOfTransactionsForOneCompany[k]);
                       arrayOfTuples.push(tripleSet);
                   }

                }
            }
        }

        for(let i = 0 ; i<arrayOfTuples.length; i++) {
            for(let j= i+1; j<arrayOfTuples.length ; j++) {
                let intersectionSet = new Set();
                intersectionSet = arrayOfTuples[i].intersection(arrayOfTuples[j]);
                if (intersectionSet.size !== 0) {
                    arrayOfTuples[i] = arrayOfTuples[i].union(arrayOfTuples[j]);
                    arrayOfTuples[j] = new Set();
                } else {
                }
            }
        }
        // Remove the empty sets formed by removing repeating elements from the set.
        let cleanedArray = arrayOfTuples.filter((el)=> {
            return el.size !== 0;
        });
        // Store it in a MAP with key as company name and array of sets
        recurringTransactionMap.set(key, cleanedArray);
    });

    let sortedMap = new Map([...recurringTransactionMap.entries()].sort((entry1, entry2)=>{
        let lowerCaseKey1 = entry1[0].toLowerCase();
        let lowerCaseKey2 = entry2[0].toLowerCase();
        return (lowerCaseKey1 < lowerCaseKey2) ? -1 : (lowerCaseKey1 > lowerCaseKey2) ? 1 : 0;

    }));
    // Store it to MONGO DB

    return sortedMap;
    //getTransaction(sortedMap);

};

export default upsertTransactions