import { NextResponse } from "next/server";
import prisma from "../../util/prisma";

export async function POST(request) {
    const data = await request.json(); 
    console.log("Payload is :",data);
    const {orderId, status} = data;

    try {
        const order = await prisma.order.update({
            where: {
                id: parseInt(orderId)
            },
            data: {
                status: status
            }
        });

        // if (status === "") {
        //     // return NextResponse.json(order, { status: 200 });
        //     return NextResponse.redirect(`https://www.store2u.ca/paymentfailed`);
        // }

        return NextResponse.json(order, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
