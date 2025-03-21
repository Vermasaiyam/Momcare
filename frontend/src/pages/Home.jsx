import React from 'react'
import Header from '../components/Header'
import SpecialityMenu from '../components/SpecialityMenu'
import TopDoctors from '../components/TopDoctors'
import Banner from '../components/Banner'
import UploadMedicalReport from '../components/MedicalReport'
import NamePredictor from '../components/NamePredictor'

const Home = () => {
  return (
    <div>
      <Header />
      <UploadMedicalReport />
      <NamePredictor />
      <SpecialityMenu />
      <TopDoctors />
      <Banner />
    </div>
  )
}

export default Home