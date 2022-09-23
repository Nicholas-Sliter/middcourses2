async function voteFetch(reviewID: string, voteType: string) {

    const res = await fetch(`/api/reviews/${reviewID}/vote`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            reviewID: reviewID,
            voteType: voteType,
        }),
    });

    let data;
    if (res.ok) {
        data = await res.json();
    }


    return {
        status: res.ok,
        message: data?.message ?? "An unknown error occurred.",
        value: data?.value ?? null,
    };
}


export default voteFetch;