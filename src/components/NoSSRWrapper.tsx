import dynamic from "next/dynamic";

const NoSSRWrapper = props => (
    <>{props.children}</>
)
export default dynamic(() => Promise.resolve(NoSSRWrapper), {
    ssr: false
})