import { Link } from 'react-router-dom'

const Friendbar = () => {
    return (
        <div className="friendbar">
            <div className="current_friends">
                <Link to="/friends">
                    <h3>Friends</h3>
                </Link>
            </div>
            <div className="pending">
                <Link to="/pending">
                    <h3>Pending</h3>
                </Link>
            </div>
            <div className="approve">
                <Link to="/approve">
                    <h3>Approve</h3>
                </Link>
            </div>
        </div>
    )
}

export default Friendbar