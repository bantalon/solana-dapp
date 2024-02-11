import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, VersionedMessage, Transaction, VersionedTransaction, TransactionSignature } from '@solana/web3.js';
import { FC, useCallback } from 'react';
import { notify } from "../utils/notifications";
import useUserSOLBalanceStore from '../stores/useUserSOLBalanceStore';
import { debug } from 'console';

function decodeBase64(input: string): Uint8Array {
    return new Uint8Array(Buffer.from(input, 'base64'));
}

export const SendEncodedTransaction: FC = () => {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();
    const { getUserSOLBalance } = useUserSOLBalanceStore();

    const onClick = useCallback(async () => {
        if (!publicKey) {
            console.log('error', 'Wallet not connected!');
            notify({ type: 'error', message: 'error', description: 'Wallet not connected!' });
            return;
        }

        let signature: TransactionSignature = '';

        try {
            // const message = VersionedMessage.deserialize(decodeBase64(base64encodedTransaction))
            // const transaction = new VersionedTransaction(message)

            const transaction = VersionedTransaction.deserialize(decodeBase64(base64encodedTransaction))

            // Send transaction and await for signature
            signature = await sendTransaction(transaction, connection);

            // Get the lates block hash to use on our transaction and confirmation
            let latestBlockhash = await connection.getLatestBlockhash()
            console.log(latestBlockhash)
            await connection.confirmTransaction({ signature, ...latestBlockhash }, 'confirmed');

            notify({ type: 'success', message: 'Transaction successful!', txid: signature });

            getUserSOLBalance(publicKey, connection);
        } catch (error: any) {
            notify({ type: 'error', message: `Transaction failed!`, description: error?.message, txid: signature });
            console.log('error', `Transaction failed! ${error?.message}`, signature);
        }
    }, [publicKey, connection, getUserSOLBalance]);

    var base64encodedTransaction: string = "";

    return (

        <div className="flex flex-row justify-center">
            <div className="relative group items-center">
                <h1 className="text-center text-5xl md:pl-12 font-bold text-transparent bg-clip-text bg-gradient-to-br from-indigo-500 to-fuchsia-500 mb-4">
                    Send base64 encoded transaction
                </h1>
                <input type="text" onChange={(event) => base64encodedTransaction = event.target.value} className="max-w-md mx-auto mockup-code bg-primary border-2 border-[#5252529f] p-6 px-10 my-2">
                </input>
                <div className='mt-6' />
                <button
                    className="px-8 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                    onClick={onClick}
                >
                    <span>Send Transaction </span>

                </button>
            </div>
        </div>


    );
};

