import "../styles/table.css";

export default function FeedbackTable({ feedback }) {
    return (
        <table>
            <thead><tr><th>User</th><th>Rating</th><th>Comment</th><th>Date</th></tr></thead>
            <tbody>
                {feedback.map(item => (
                    <tr key={item.id}>
                        <td>{item.name} <br/> <span className="email-text">{item.email}</span></td>
                        <td>{'⭐'.repeat(item.rating)}</td>
                        <td className="comment-cell">{item.comment}</td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
}