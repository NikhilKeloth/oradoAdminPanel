import { useParams } from "react-router-dom";
import AdminOrdersContent from "./AdminOrderContent";

const AdminCustomerOrderPage = () => {
    const {userId} = useParams()
    return <AdminOrdersContent userId = {userId}/>
}

export default AdminCustomerOrderPage