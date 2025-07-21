export function createOrderRow(order) {
    console.log("Creazione riga per ordine:", order);
    console.log(order.id_ordine);
    return `
        <tr>
            <td>${order.id_ordine}</td>
            <td>${order.nome_prodotto_ordine}</td>
            <td>€${order.prezzo_prodotto.toFixed(2)}</td>
            <td>${order.quantita_ordine}</td>
            <td>${order.taglia}</td>
            <td>€${(order.prezzo_prodotto * order.quantita_ordine).toFixed(2)}</td>
            <td>${order.data_ordine}</td>
        </tr>
    `;
}