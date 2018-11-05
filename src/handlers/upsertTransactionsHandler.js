import similarString from '../utils/strings';
import dateFunctions from '../utils/dates';
import amountFunctions from '../utils/amount';

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
        //console.log('Key found....');
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
               // console.log('SIMILAR....');
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

const upsertTransactions = async (transactionObject) => {
    // Loop through each element in the transactions that are coming in and ADD each transaction into MAP based of company name
    let transactionsInput = transactionObject.transaction;
    transactionsInput.forEach(currentTransaction => {
        let transactionsObjectInMap = matchKey(currentTransaction.name, storingTransactionsMAP);
        if (Object.keys(transactionsObjectInMap).length === 0) {
            storingTransactionsMAP.set(currentTransaction.name, [currentTransaction]);
        }
        else {
            transactionsObjectInMap.records.push(currentTransaction);
        }
    });
    console.log('-----------------------------------------------------------------------------');

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
    console.log('-----------------------------------------------------------------------------');

    let arrayOfTransactionsForOneCompany = [];
    let arrayOfTuples=[];
    companyNameKeyArray.forEach(key=>{
        arrayOfTransactionsForOneCompany = [...storingTransactionsMAP.get(key)];

        for(let i =0 ; i< arrayOfTransactionsForOneCompany.length-2; i++) {

            for(let j=i+1; j<arrayOfTransactionsForOneCompany.length-1; j++) {

                for(let k=j+1; k<arrayOfTransactionsForOneCompany.length; k++) {
                    let tripleSet = new Set();
                   let num_of_days_between_1_2 = dateFunctions.daysBetweenDates(arrayOfTransactionsForOneCompany[i].date, arrayOfTransactionsForOneCompany[j].date);
                   let num_of_days_between_2_3 = dateFunctions.daysBetweenDates(arrayOfTransactionsForOneCompany[j].date, arrayOfTransactionsForOneCompany[k].date);
                   let amount_difference_between_1_2 = amountFunctions.amountDifference(arrayOfTransactionsForOneCompany[i].amount, arrayOfTransactionsForOneCompany[j].amount);
                   let amount_difference_between_2_3 = amountFunctions.amountDifference(arrayOfTransactionsForOneCompany[j].amount, arrayOfTransactionsForOneCompany[k].amount);
                   let recurrencePeriodDifference = dateFunctions.recurrencePeriodDifference(num_of_days_between_1_2, num_of_days_between_2_3);

                   if (amount_difference_between_1_2 && amount_difference_between_2_3 && recurrencePeriodDifference) {
                       tripleSet.add(arrayOfTransactionsForOneCompany[i]);
                       tripleSet.add(arrayOfTransactionsForOneCompany[j]);
                       tripleSet.add(arrayOfTransactionsForOneCompany[k]);
                       console.log('THE SET IS ----- ');
                       console.log(tripleSet);
                       arrayOfTuples.push(tripleSet);
                   }

                }
            }
        }
        console.log('---------------------------- ARRAY OF TUPLES ---------------------------------------------------');
        console.log(arrayOfTuples);
        console.log('ELEMENTS IN ARRAY OF TUPLES....');
        for(let i = 0 ; i<arrayOfTuples.length; i++) {
            for(let j= i+1; j<arrayOfTuples.length ; j++) {
                let intersectionSet = new Set();
                intersectionSet = arrayOfTuples[i].intersection(arrayOfTuples[j]);
                console.log('INTERSECTION SETS ARE ------------');
                console.log(intersectionSet);
                console.log('i ---- ', i);
                console.log('j ---- ', j);
                console.log('INTERSECTION LENGTH IS--- -- - ',intersectionSet.size);
                if (intersectionSet.size !== 0) {
                    arrayOfTuples[i] = arrayOfTuples[i].union(arrayOfTuples[j]);
                    arrayOfTuples[j] = new Set();
                } else {
                    console.log('GOING TO ELSE....');
                }
            }
        }
        console.log('-----------------------------------------------------------------------------');

        let cleanedArray = arrayOfTuples.filter((el)=> {
            return el.size !== 0;
        });
        console.log('CLEAN ARRAY OF TUPLES is ---- ');
        console.log(cleanedArray);



        console.log('-----------------------------------------------------------------------------');
    });















    //console.log('FINAL SORTED TRANSACTION MAP IS _----- ', sortedMap);


   // let sortedMap = new Map([...storingTransactionsMAP.entries()].sort((transaction1, transaction2) => {
   //     let transaction1Key = transaction1[0].toLowerCase();
   //     let transaction2Key = transaction2[0].toLowerCase();
   //     return (transaction1Key < transaction2Key) ? -1 : (transaction1Key > transaction2Key) ? 1 : 0;
   // }));
   // //console.log('Sorted MAP is ---- ', sortedMap);
   //
   //  let vpn = sortedMap.get('VPN Service');
   //  console.log('VPN ______---------- ',vpn);
   //  vpn.forEach(vpnTransaction => {
   //      if (vpnTransaction.transactions.length >=3) {
   //          console.log('------------- RECURRING TRANSACTIONS ARE ------------');
   //          console.log(vpnTransaction.transactions);
   //      }
   //  });
   //  console.log('-----------------VPN ---------------- FINAL ----------------');
   //  console.log(storingTransactionsMAP.get('VPN Service'));
};

export default upsertTransactions