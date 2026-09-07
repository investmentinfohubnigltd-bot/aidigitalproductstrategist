import Nav from './components/Nav'
import Hero from './components/Hero'
import About from './components/About'
import Services from './components/Services'
import Portfolio from './components/Portfolio'
import Process from './components/Process'
import Contact from './components/Contact'
import Footer from './components/Footer'

export default function Home() {
  return <><Nav /><main id="main"><Hero /><About /><Services /><Portfolio /><Process /><Contact /></main><Footer /></>
}
