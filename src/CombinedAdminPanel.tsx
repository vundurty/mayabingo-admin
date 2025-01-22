import { useState, useEffect } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firestore } from "./firebase";

const CombinedAdminPanel = () => {
   
    const [fromDate, setFromDate] = useState("");
    const [fromTime, setFromTime] = useState("");
    const [toDate, setToDate] = useState("");
    const [toTime, setToTime] = useState("");
    const [gamesCount, setGamesCount] = useState("");

    const initialBonusData = Array.from({ length: 10 }, (_, index) => ({
        rank: index + 1,
        "20br": "",
        "50br": "",
        "100br": "",
        "200br": "",
    }));
    const [bonusData, setBonusData] = useState(initialBonusData);
    const [isActive, setIsActive] = useState(true);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                
                const combinedDocRef = doc(firestore, "bonus", "active");
                const combinedDocSnap = await getDoc(combinedDocRef);

                if (combinedDocSnap.exists()) {
                    const data = combinedDocSnap.data();

                    // Handle admin data
                    if (data.admin) {
                        if (data.admin.fromDateTime) {
                            const fromDT = new Date(data.admin.fromDateTime);
                            setFromDate(fromDT.toISOString().split('T')[0]);
                            setFromTime(fromDT.toTimeString().slice(0, 5));
                        }
                        if (data.admin.toDateTime) {
                            const toDT = new Date(data.admin.toDateTime);
                            setToDate(toDT.toISOString().split('T')[0]);
                            setToTime(toDT.toTimeString().slice(0, 5));
                        }
                        setGamesCount(data.admin.gamesCount?.toString() || "");
                    }

                    
                    if (data.bonus) {
                        setIsActive(data.bonus.active ?? true);

                        const newBonusData = initialBonusData.map(row => {
                            const rankData = data.bonus.ranks?.[`rank-${row.rank}`] || {};
                            return {
                                rank: row.rank,
                                "20br": rankData["20br"] || "",
                                "50br": rankData["50br"] || "",
                                "100br": rankData["100br"] || "",
                                "200br": rankData["200br"] || "",
                            };
                        });

                        setBonusData(newBonusData);
                    }
                }

                setIsLoading(false);
            } catch (error) {
                console.error("Error fetching data:", error);
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);

    //@ts-ignore
    const handleBonusInputChange = (e, rank, column) => {
        const { value } = e.target;
        setBonusData((prevData) =>
            prevData.map((row) =>
                row.rank === rank ? { ...row, [column]: value } : row
            )
        );
    };
    //@ts-ignore

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const timestamp = new Date().getTime();

            // Prepare admin data
            const fromDateTime = new Date(`${fromDate}T${fromTime}`).toISOString();
            const toDateTime = new Date(`${toDate}T${toTime}`).toISOString();

            const adminData = {
                fromDateTime,
                toDateTime,
                gamesCount: parseInt(gamesCount, 10),
                createdAt: new Date().toISOString()
            };

            // Prepare bonus data
            const ranks = {};
            bonusData.forEach((row) => {
                //@ts-ignore

                ranks[`rank-${row.rank}`] = {
                    "20br": row["20br"],
                    "50br": row["50br"],
                    "100br": row["100br"],
                    "200br": row["200br"],
                };
            });

            const bonusDataToSave = {
                active: isActive,
                ranks: ranks,
                createdAt: timestamp,
            };

            
            const combinedData = {
                admin: adminData,
                bonus: bonusDataToSave,
                updatedAt: timestamp
            };

           
            const historyDocId = `history_${timestamp}`;
            await setDoc(doc(firestore, "bonus", historyDocId), combinedData);

            
            await setDoc(doc(firestore, "bonus", "active"), {
                ...combinedData,
                latestDocId: historyDocId
            });

            alert("All records updated successfully!");
        } catch (error) {
            console.error("Error updating records:", error);
            alert("Failed to save data!");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="p-4">
                <div className="text-center">Loading...</div>
            </div>
        );
    }

    return (
        <form className="p-4" onSubmit={handleSubmit}>
            {/* Time Range Section */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Time Range Settings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block mb-2 font-bold">From Date</label>
                        <input
                            type="date"
                            className="border rounded p-2 w-full"
                            value={fromDate}
                            onChange={(e) => setFromDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-bold">From Time</label>
                        <input
                            type="time"
                            className="border rounded p-2 w-full"
                            value={fromTime}
                            onChange={(e) => setFromTime(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block mb-2 font-bold">To Date</label>
                        <input
                            type="date"
                            className="border rounded p-2 w-full"
                            value={toDate}
                            onChange={(e) => setToDate(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-2 font-bold">To Time</label>
                        <input
                            type="time"
                            className="border rounded p-2 w-full"
                            value={toTime}
                            onChange={(e) => setToTime(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block mb-2 font-bold">Minimum games to be played</label>
                    <input
                        type="number"
                        className="border rounded p-2 w-full"
                        value={gamesCount}
                        onChange={(e) => setGamesCount(e.target.value)}
                        min="0"
                        required
                    />
                </div>
            </div>

            {/* Bonus Table Section */}
            <div className="mb-8">
                <h2 className="text-xl font-bold mb-4">Bonus Settings</h2>
                <table className="table-auto w-full border-collapse border border-gray-300">
                    <thead>
                        <tr>
                            <th className="border border-gray-300 px-4 py-2 text-left">Rank</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">20Birr</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">50Birr</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">100Birr</th>
                            <th className="border border-gray-300 px-4 py-2 text-left">200Birr</th>
                        </tr>
                    </thead>
                    <tbody>
                        {bonusData.map((row) => (
                            <tr key={row.rank}>
                                <td className="border border-gray-300 px-4 py-2">{row.rank}</td>
                                {["20br", "50br", "100br", "200br"].map((column) => (
                                    <td key={column} className="border border-gray-300 px-4 py-2">
                                        <input
                                            type="number"
                                            step="1"
                                            min="0"
                                            //@ts-ignore

                                            value={row[column]}
                                            onChange={(e) => {
                                                // Remove any decimals and convert to integer
                                                const value = Math.floor(Number(e.target.value));
                                                //@ts-ignore

                                                handleBonusInputChange(e, row.rank, column, value);
                                            }}
                                            onKeyDown={(e) => {
                                                // Prevent decimal point
                                                if (e.key === '.') {
                                                    e.preventDefault();
                                                }
                                            }}
                                            className="border rounded p-1 w-full"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 disabled:bg-gray-400"
                disabled={isLoading}
            >
                {isLoading ? 'Saving...' : 'Save All Settings'}
            </button>
        </form>
    );
};

export default CombinedAdminPanel;