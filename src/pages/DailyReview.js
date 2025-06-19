import React, {
    useState,
    useEffect
} from 'react';
import {
    db
} from '../firebase';
import {
    collection,
    query,
    where,
    getDocs,
    Timestamp,
    addDoc,
    setDoc,
    doc,
    updateDoc,
    deleteDoc,
    orderBy,
} from 'firebase/firestore';
import {
    useCapital
} from './CapitalContext';

const DailyReview = () => {
    const [selectedDate, setSelectedDate] = useState('');
    const [trades, setTrades] = useState([]);
    const [editIdx, setEditIdx] = useState(null);
    const [editTrade, setEditTrade] = useState({});
    const [pnlSummary, setPnlSummary] = useState(0);
    const [reviewFields, setReviewFields] = useState({
        mistakes: '',
        goodMoves: '',
        learning: '',
        improvement: '',
    });
    const [loading, setLoading] = useState(false);
    const {
        refreshCapitalValue
    } = useCapital();

    const handleDateChange = (e) => {
        setSelectedDate(e.target.value);
    };

    const handleReviewChange = (e) => {
        setReviewFields({
            ...reviewFields,
            [e.target.name]: e.target.value
        });
    };

    const handleEditChange = (e) => {
        setEditTrade({
            ...editTrade,
            [e.target.name]: e.target.value
        });
    };

    const fetchTrades = async () => {
        if (!selectedDate) return;
        setLoading(true);
        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);

        const q = query(
            collection(db, 'dailyTrades'),
            where('date', '>=', Timestamp.fromDate(start)),
            where('date', '<=', Timestamp.fromDate(end)),
            orderBy('date', 'desc')
        );

        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        }));

        setTrades(fetched);
        setPnlSummary(fetched.reduce((acc, t) => acc + (parseFloat(t.pnl) || 0), 0));
        setLoading(false);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Confirm delete?')) return;
        setLoading(true);
        await deleteDoc(doc(db, 'dailyTrades', id));
        await fetchTrades();
        await refreshCapitalValue();
        setLoading(false);
    };

    const handleEdit = (trade, index) => {
        setEditIdx(index);
        setEditTrade(trade);
    };

    const handleSave = async () => {
        const ref = doc(db, 'dailyTrades', editTrade.id);
        const updated = {
            ...editTrade
        };
        delete updated.id;
        setLoading(true);
        await updateDoc(ref, updated);
        setEditIdx(null);
        setEditTrade({});
        await fetchTrades();
        await refreshCapitalValue();
        setLoading(false);
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        if (!selectedDate) return;
        setLoading(true);

        const start = new Date(selectedDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);

        const reviewQuery = query(
            collection(db, 'dailyReviews'),
            where('date', '>=', Timestamp.fromDate(start)),
            where('date', '<=', Timestamp.fromDate(end))
        );

        const snapshot = await getDocs(reviewQuery);
        const payload = {
            ...reviewFields,
            date: Timestamp.fromDate(new Date(selectedDate)),
        };

        if (!snapshot.empty) {
            const docId = snapshot.docs[0].id;
            await setDoc(doc(db, 'dailyReviews', docId), payload);
        } else {
            await addDoc(collection(db, 'dailyReviews'), payload);
        }
        setLoading(false);
        alert('Review saved!');
    };

    useEffect(() => {
        fetchTrades();
    }, [selectedDate]);

    return ( <
        div className = "p-6 max-w-7xl mx-auto" >
        <
        h2 className = "text-2xl font-bold mb-4" > Daily Review < /h2> <
        input type = "date"
        value = {
            selectedDate
        }
        onChange = {
            handleDateChange
        }
        className = "calendar-input" /
        >

        {
            loading ? ( <
                p className = "text-blue-600 mt-4" > ⏳Loading... < /p>
            ) : trades.length > 0 ? ( <
                >
                <
                h3 className = "text-xl font-semibold my-3" > Trades on {
                    selectedDate
                } < /h3> <
                table className = "trade-table" >
                <
                thead >
                <
                tr > {
                    ['Coin', 'Type', 'Entry', 'Exit', 'SL', 'Target', 'Status', 'P&L', 'Mistakes', 'Good Moves', 'Actions'].map(head => ( <
                        th key = {
                            head
                        } > {
                            head
                        } < /th>
                    ))
                } <
                /tr> <
                /thead> <
                tbody > {
                    trades.map((trade, i) => ( <
                        tr key = {
                            trade.id
                        }
                        style = {
                            {
                                verticalAlign: 'middle'
                            }
                        } > {
                            editIdx === i ? ( <
                                >
                                <
                                td > < input name = "coin"
                                value = {
                                    editTrade.coin
                                }
                                onChange = {
                                    handleEditChange
                                }
                                className = "table-input" / > < /td> <
                                td >
                                <
                                select name = "type"
                                value = {
                                    editTrade.type
                                }
                                onChange = {
                                    handleEditChange
                                }
                                className = "table-input" >
                                <
                                option > Long < /option><option>Short</option >
                                <
                                /select> <
                                /td> <
                                td > < input name = "entry"
                                value = {
                                    editTrade.entry
                                }
                                onChange = {
                                    handleEditChange
                                }
                                className = "table-input" / > < /td> <
                                td > < input name = "exit"
                                value = {
                                    editTrade.exit
                                }
                                onChange = {
                                    handleEditChange
                                }
                                className = "table-input" / > < /td> <
                                td > < input name = "sl"
                                value = {
                                    editTrade.sl
                                }
                                onChange = {
                                    handleEditChange
                                }
                                className = "table-input" / > < /td> <
                                td > < input name = "target"
                                value = {
                                    editTrade.target
                                }
                                onChange = {
                                    handleEditChange
                                }
                                className = "table-input" / > < /td> <
                                td >
                                <
                                select name = "status"
                                value = {
                                    editTrade.status
                                }
                                onChange = {
                                    handleEditChange
                                }
                                className = "table-input" >
                                <
                                option > Win < /option><option>Loss</option > < option > BreakEven < /option> <
                                /select> <
                                /td> <
                                td > < input name = "pnl"
                                value = {
                                    editTrade.pnl
                                }
                                onChange = {
                                    handleEditChange
                                }
                                className = "table-input" / > < /td> <
                                td > < input name = "mistakes"
                                value = {
                                    editTrade.mistakes
                                }
                                onChange = {
                                    handleEditChange
                                }
                                className = "table-input" / > < /td> <
                                td > < input name = "goodMoves"
                                value = {
                                    editTrade.goodMoves
                                }
                                onChange = {
                                    handleEditChange
                                }
                                className = "table-input" / > < /td> <
                                td style = {
                                    {
                                        whiteSpace: 'nowrap'
                                    }
                                } >
                                <
                                button onClick = {
                                    handleSave
                                }
                                className = "text-green-600 mr-2" > Save < /button> <
                                button onClick = {
                                    () => setEditIdx(null)
                                } > Cancel < /button> <
                                /td> <
                                />
                            ) : ( <
                                >
                                <
                                td > {
                                    trade.coin
                                } < /td> <
                                td > {
                                    trade.type
                                } < /td> <
                                td > {
                                    trade.entry
                                } < /td> <
                                td > {
                                    trade.exit
                                } < /td> <
                                td > {
                                    trade.sl
                                } < /td> <
                                td > {
                                    trade.target
                                } < /td> <
                                td > {
                                    trade.status
                                } < /td> <
                                td > ₹{
                                    trade.pnl
                                } < /td> <
                                td > {
                                    trade.mistakes
                                } < /td> <
                                td > {
                                    trade.goodMoves
                                } < /td> <
                                td style = {
                                    {
                                        whiteSpace: 'nowrap'
                                    }
                                } >
                                <
                                button onClick = {
                                    () => handleEdit(trade, i)
                                }
                                className = "text-blue-600 mr-2" > Edit < /button> <
                                button onClick = {
                                    () => handleDelete(trade.id)
                                }
                                className = "text-red-600" > Delete < /button> <
                                /td> <
                                />
                            )
                        } <
                        /tr>
                    ))
                } <
                /tbody> <
                /table>

                <
                p className = "mt-2 font-semibold" > Total P & L of Day: ₹{
                    pnlSummary
                } < /p>

                <
                form onSubmit = {
                    handleReviewSubmit
                }
                className = "grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-4 mt-6 shadow rounded" > {
                    ['mistakes', 'goodMoves', 'learning', 'improvement'].map(field => ( <
                        textarea key = {
                            field
                        }
                        name = {
                            field
                        }
                        placeholder = {
                            field.charAt(0).toUpperCase() + field.slice(1)
                        }
                        value = {
                            reviewFields[field]
                        }
                        onChange = {
                            handleReviewChange
                        }
                        className = "border p-2 rounded h-24" /
                        >
                    ))
                } <
                button type = "submit"
                className = "submit-btn" > Submit < /button> <
                /form> <
                />
            ) : (
                selectedDate && !loading && ( <
                    p className = "text-red-600 mt-4" > No trades found
                    for this date. < /p>
                )
            )
        } <
        /div>
    );
};

export default DailyReview;