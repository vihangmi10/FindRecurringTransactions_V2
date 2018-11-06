import mongoose from 'mongoose';

let recurringTransactionSchema = new mongoose.schema({
            "String":
            [
                {
                    "name": String,
                    "user_id": String,
                    "next_amt": String,
                    "next_date": String,
                    "transactions": [
                        {
                            "trans_id": String,
                            "user_id": String,
                            "name": String,
                            "amount": Number,
                            "date": String

                        }
                    ]
                }
            ]
});